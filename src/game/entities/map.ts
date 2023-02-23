import { Container, Assets, Point } from 'pixi.js';
import { Tile } from './tile';
import computeFov from '../../fov';
import properties from '../../properties';

export type PropertyNames = 'vision-distance' | 'map-tiles' | 'reveal-tiles';
properties.register('vision-distance', 1000, 'radius around player where tiles are revealed'); // only high number to prevent infinite recursion
properties.register('map-tiles', false, 'revealed tiles stay visible on map');
properties.register('reveal-tiles', false, 'all tiles are revealed on map');

export interface TileInfo {
    position: Point;
    name: string;
    description: string;
}

export class TileMap extends Container {
    private readonly data: string;
    private readonly info: TileInfo[];
    private readonly tiles = new Array<Tile>();
    private readonly movables = new Array<Tile>();
    private readonly layers = new Array<Container>(2);
    private readonly dimensions = new Point(0, 0);

    public static readonly scale: number = 0.14;
    public static readonly tileDim: number = TileMap.scale * 128;

    public player: Tile | undefined;
    private _highlight: Tile | undefined;

    constructor(name: string) {
        super();

        this.name = name;
        this.data = Assets.get(name);
        this.info = Assets.get(`${name}.info`);
        if (this.info === undefined) this.info = new Array<TileInfo>();

        this.layers[0] = this.addChild(new Container()); // for tiles
        this.layers[1] = this.addChild(new Container()); // for movables

        this.registerChanges();
    }

    private registerChanges(): void {
        properties.onChange('map-tiles', () => {
            const mapTiles = properties.getBool('map-tiles');
            this.tiles.forEach((tile) => {
                tile.graphic.alpha.hide = mapTiles ? 0.3 : 0.0;
            });
        });
        properties.onChange('reveal-tiles', () => {
            const revealTiles = properties.getBool('reveal-tiles');
            this.tiles.forEach((tile) => {
                tile.graphic.sprite.alpha = revealTiles ? 0.3 : 0.0;
                tile.graphic.alpha.hide = revealTiles ? 0.3 : 0.0;
            });
        });
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
                    this.layers[0].addChild(tile.graphic.sprite);
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
                        const specific = this.info.find((tileInfo) => {
                            return (
                                tileInfo.position.x === currentPosition.x && tileInfo.position.y === currentPosition.y
                            );
                        });

                        const tile = new Tile(tileName, currentPosition, specific);
                        if (tileType.kind === 'player') {
                            this.player = tile;
                        } else {
                            this.movables.push(tile);
                        }
                        this.layers[1].addChild(tile.graphic.sprite);
                        tileName = 'ground';
                    }
                }

                const tile = new Tile(tileName, currentPosition);
                this.tiles.push(tile);
                this.layers[0].addChild(tile.graphic.sprite);
                currentPosition.x++;
            }
        }

        this._highlight = new Tile('frame', currentPosition);
        this.layers[1].addChild(this._highlight.graphic.sprite);

        this.updateVision();
    }

    private posToCoord(position: Point): Point {
        position = new Point(
            position.x - this.position.x - TileMap.tileDim / 2,
            position.y - this.position.y - TileMap.tileDim / 2
        );
        return new Point(Math.round(position.x / TileMap.tileDim), Math.round(position.y / TileMap.tileDim));
    }

    public highlight(position: Point): void {
        if (this._highlight === undefined) return;

        const coord = this.posToCoord(position);
        if (this._highlight.graphic.position.equals(coord)) return;

        let tile = this.movable(coord);
        if (tile === undefined) tile = this.tile(coord);
        if (tile === undefined || !tile.graphic.visible) {
            if (this._highlight.graphic.visible) this._highlight.graphic.hide();
            return;
        }

        this._highlight.graphic.position = coord;
        if (!this._highlight.graphic.visible) this._highlight.graphic.show();
    }

    public move(name: string, direction: Point): void {
        const movable = name === 'player' ? this.player : this.movables.find((movable) => movable.name === name);
        if (movable === undefined) return;

        const targetCoord = new Point(
            movable.graphic.position.x + direction.x,
            movable.graphic.position.y + direction.y
        );
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
            if (movable.graphic.position.x === coord.x && movable.graphic.position.y === coord.y) return movable;
        }
        return undefined;
    }

    private updateVision(): void {
        this.visibles.forEach((coord) => {
            const movable = this.movable(coord);
            if (movable !== undefined) movable.graphic.hide();
            else this.tile(coord)?.graphic.hide();
        });
        this.visibles.length = 0;

        if (this.player !== undefined) {
            computeFov(
                this.player.graphic.position,
                this.isBlocking.bind(this),
                this.markVisible.bind(this),
                properties.getNumber('vision-distance')
            );
        }

        this.visibles.forEach((coord) => {
            const movable = this.movable(coord);
            if (movable !== undefined) movable.graphic.show();
            else this.tile(coord)?.graphic.show();
        });
    }

    private readonly visibles = new Array<Point>();

    private markVisible(coord: Point): void {
        this.visibles.push(coord);
    }

    private isBlocking(coord: Point): boolean {
        const tile = this.tile(coord);
        if (tile === undefined) return false;

        return tile.blocksView;
    }
}
