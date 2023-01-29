import { Container, Assets, Point } from 'pixi.js';
import { Tile } from './tile';
import computeFov from '../../fov';
import properties from '../../properties';

export type PropertyNames = 'vision-distance';
properties.register('vision-distance', Infinity, 'radius around player where tiles are revealed');

export class TileMap extends Container {
    private readonly data: string = '';
    private readonly tiles = new Array<Tile>();
    private readonly movables = new Array<Tile>();
    private readonly layers = new Array<Container>(2);
    private readonly dimensions = new Point(0, 0);

    public static readonly scale: number = 0.1;
    public static readonly tileDim: number = TileMap.scale * 128;

    public player: Tile | undefined;

    constructor(name: string) {
        super();

        this.name = name;
        this.data = Assets.get(name);

        this.layers[0] = this.addChild(new Container()); // for tiles
        this.layers[1] = this.addChild(new Container()); // for movables
    }

    private checkMapDimensions(mapData: string): void {
        let width = 0;
        for (const char of mapData) {
            if (char === '\n') {
                if (width > this.dimensions.x) this.dimensions.x = width;
                this.dimensions.y++;
                width = 0;
            } else {
                width++;
            }
        }
    }

    public load(): void {
        const mapData: string = this.data.replace(/(.) /gm, '$1');

        this.checkMapDimensions(mapData);

        const currentPosition = new Point(0, 0);
        for (const char of mapData) {
            if (char === '\n') {
                while (currentPosition.x < this.dimensions.x) {
                    const tile = new Tile('chasm', currentPosition);
                    this.tiles.push(tile);
                    this.layers[0].addChild(tile.sprite);
                    currentPosition.x++;
                }
                currentPosition.x = 0;
                currentPosition.y++;
            } else {
                let tileName: string;
                const tileType = Tile.charMap.get(char);
                if (tileType === undefined) {
                    console.error(`map symbol unknown: ${char}`);
                    tileName = 'chasm';
                } else {
                    tileName = tileType.name;
                    if (['player', 'enemy', 'item'].includes(tileType.kind)) {
                        const tile = new Tile(tileName, currentPosition);
                        if (tileType.kind === 'player') {
                            this.player = tile;
                        } else {
                            this.movables.push(tile);
                        }
                        this.layers[1].addChild(tile.sprite);
                        tileName = 'ground';
                    }
                }

                const tile = new Tile(tileName, currentPosition);
                this.tiles.push(tile);
                this.layers[0].addChild(tile.sprite);
                currentPosition.x++;
            }
        }

        this.updateVision();
    }

    public move(name: string, direction: Point): void {
        const movable = name === 'player' ? this.player : this.movables.find((movable) => movable.name === name);
        if (movable === undefined) return;

        const targetCoord = new Point(movable.position.x + direction.x, movable.position.y + direction.y);
        let target = this.movable(targetCoord);
        if (target === undefined) target = this.tile(targetCoord);
        if (target === undefined) return;

        target.act(movable);

        this.updateVision();
    }

    private tile(coord: Point): Tile | undefined {
        return this.tiles.at(coord.x + coord.y * this.dimensions.x);
    }

    private movable(coord: Point): Tile | undefined {
        for (const movable of this.movables.values()) {
            if (movable.position.x === coord.x && movable.position.y === coord.y) return movable;
        }
        return undefined;
    }

    private isBlocking(coord: Point): boolean {
        const tile = this.tile(coord);
        if (tile === undefined) return false;

        return tile.blocksView;
    }

    private readonly visibles = new Array<Point>();

    private markVisible(coord: Point): void {
        this.visibles.push(coord);
    }

    private updateVision(): void {
        this.visibles.forEach((coord) => {
            this.movable(coord)?.hide();
            this.tile(coord)?.hide();
        });
        this.visibles.length = 0;

        if (this.player !== undefined) {
            computeFov(
                this.player.position,
                this.isBlocking.bind(this),
                this.markVisible.bind(this),
                properties.getNumber('vision-distance')
            );
        }

        this.visibles.forEach((coord) => {
            this.movable(coord)?.show();
            this.tile(coord)?.show();
        });
    }
}
