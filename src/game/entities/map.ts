import { Container, Assets, Point } from 'pixi.js';
import { Tile } from './tile';
import computeFov from '../../fast/fov';
import unveilRoom from '../../fast/fill';
import properties from '../../engine/properties';
import { readMap } from '../../engine/schemes';
import dialog from '../proxies/dialog';

export type PropertyNames = 'vision-distance' | 'map-tiles' | 'reveal-tiles';
properties.register('vision-distance', 1, 'radius around player where tiles are revealed'); // only high number to prevent infinite recursion
properties.register('map-tiles', false, 'revealed tiles stay visible on map');
properties.register('reveal-tiles', false, 'all tiles are revealed on map');

export class TileMap extends Container {
    private readonly tiles = new Array<Tile>();
    private readonly objects = new Array<Tile>();
    private readonly layers = new Array<Container>(2);
    private readonly dimensions = new Point(0, 0);

    public static readonly scale: number = 3.0;
    public static readonly tileDim: number = TileMap.scale * 16;

    public player: Tile | undefined;
    private _highlight: Tile | undefined;
    private moving = false;

    constructor(name: string) {
        super();

        this.label = name;

        this.layers[0] = this.addChild(new Container()); // for tiles
        this.layers[1] = this.addChild(new Container()); // for objects
        this.layers[1].sortableChildren = true;

        this.registerChanges();
    }

    private registerChanges(): void {
        properties.onChange('reveal-tiles', (revealTiles: boolean) => {
            this.visibles.length = 0;
            if (revealTiles) {
                this.tiles.forEach((tile) => {
                    this.visibles.push(tile.graphic.position);
                });
            }
            this.updateVision();
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
        const data = readMap(Assets.get(this.label as string));
        const layout = data.layout.replace(/(.) /gm, '$1').replace(/^\n/, '');
        const wallChar = this.getKey(data.key, 'wall');

        this.checkMapDimensions(layout);
        Tile.removeFromMap = this.remove.bind(this);

        const currentPosition = new Point(0, 0);
        for (let idx = 0; idx < layout.length; idx++) {
            const char = layout[idx];
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
                let tileName = data.key.get(char);
                if (tileName === undefined) {
                    console.error(`map symbol unknown: ${char}`);
                    tileName = 'chasm';
                }

                if (tileName !== 'floor') {
                    let subTile = '';
                    if (tileName === 'wall') subTile = this.wallsAround(layout, idx, wallChar);
                    else if (tileName === 'door') subTile = this.alignedDoor(this.wallsAround(layout, idx, wallChar));

                    const tile = new Tile(tileName, currentPosition, subTile);

                    if (['player', 'enemy', 'item'].includes(tile.kind)) {
                        if (tile.kind === 'player') {
                            this.player = tile;
                        } else {
                            this.objects.push(tile);
                        }
                        tileName = 'floor';
                    } else {
                        this.objects.push(tile);
                        tileName = 'floor';
                    }

                    const child = this.layers[1].addChild(tile.graphic.sprite);
                    child.zIndex = currentPosition.y;
                }

                const floorTile = new Tile('floor', currentPosition, this.randomFloor());
                if (tileName === 'floor') this.tiles.push(floorTile);
                this.layers[0].addChild(floorTile.graphic.sprite);

                currentPosition.x++;
            }
        }

        this._highlight = new Tile('frame', currentPosition);
        this.layers[1].addChild(this._highlight.graphic.sprite);

        if (this.player === undefined) return;

        if (this.player !== undefined) {
            this.player.graphic.onMove = this.focusPos.bind(this);
            this.move('player', new Point());
        }

        dialog.tellStory('intro', 'enter');
    }

    private getKey(map: Map<any, any>, value: any): string {
        return [...map].find(([k, v]) => v === value)?.at(0);
    }

    private wallsAround(layout: string, idx: number, wallChar: string): string {
        let subtile = '';
        if (layout[idx - this.dimensions.x - 1] === wallChar) subtile += 'n';
        if (layout[idx + 1] === wallChar) subtile += 'e';
        if (layout[idx + this.dimensions.x + 1] === wallChar) subtile += 's';
        if (layout[idx - 1] === wallChar) subtile += 'w';
        if (subtile === '') subtile += 'o';
        return subtile;
    }

    private randomFloor(): string {
        const randomNumber = Math.random();
        let floorVariant = 1;
        if (randomNumber < 0.7) floorVariant = 1;
        else if (randomNumber < 0.8) floorVariant = 2;
        else if (randomNumber < 0.9) floorVariant = 3;
        else floorVariant = 4;
        return floorVariant.toString();
    }

    private alignedDoor(walls: string): string {
        let alignment = '';
        if (walls.includes('n') || walls.includes('s')) alignment = 'vc';
        else if (walls.includes('e') || walls.includes('w')) alignment = 'hc';
        return alignment;
    }

    private posToCoord(position: Point): Point {
        position = new Point(position.x - TileMap.tileDim / 2, position.y - TileMap.tileDim / 2);
        return position.multiplyScalar(1 / TileMap.tileDim).round();
    }

    private coordToPos(coord: Point): Point {
        return coord.multiplyScalar(TileMap.tileDim);
    }

    public highlight(position: Point, offset: Point): void {
        position = position.subtract(offset).add(this.pivot);
        if (this._highlight === undefined) return;

        const coord = this.posToCoord(position);
        if (this._highlight.graphic.position.equals(coord)) return;
        this._highlight.graphic.position = coord;

        const tile = this.entity(coord);
        if (tile === undefined || !tile.graphic.visible) {
            if (this._highlight.graphic.visible) {
                this._highlight.graphic.hide();
            }
            return;
        }

        if (!this._highlight.graphic.visible) this._highlight.graphic.show();

        const nextCoordPos = this.coordToPos(new Point(coord.x + 1, coord.y));
        dialog.tell(tile.info, nextCoordPos.add(offset));
    }

    public move(name: string, direction: Point): boolean {
        if (this.moving) return false;

        const actor = name === 'player' ? this.player : this.objects.find((object) => object.name === name);
        if (actor === undefined) return false;

        const originCoord = actor.graphic.position;
        let origin = this.object(originCoord);
        if (origin === undefined) origin = this.tile(originCoord);
        if (origin === undefined) return false;

        const targetCoord = actor.graphic.position.add(direction);
        let target = this.object(targetCoord);
        if (target === undefined) target = this.tile(targetCoord);
        if (target === undefined) return false;

        const queue = async (): Promise<void> => {
            await target?.act(actor);
            await origin?.leave(actor);
            // this.updateOthers();
            this.updateVision();
        };
        
        this.moving = true;
        queue().then(() => {
            this.moving = false;
        }).catch((message) => {
            console.error(message);
        });
        
        return true;
    }

    public focusPos(position: Point): void {
        const view = document.getElementById('pixi-content') as HTMLDivElement;

        const cameraPos = new Point(
            view.offsetWidth / 2 - position.x - TileMap.tileDim / 2,
            view.offsetHeight / 2 - position.y - TileMap.tileDim / 2,
        );
        this.pivot.copyFrom(cameraPos.multiplyScalar(-1));
    }

    public remove(tile: Tile): void {
        this.layers[1].removeChild(tile.graphic.sprite);
        const idx = this.objects.indexOf(tile);
        if (idx > -1) this.objects.splice(idx, 1);
    }

    private tile(coord: Point): Tile | undefined {
        if (coord.x >= this.dimensions.x) return undefined;
        return this.tiles.at(coord.x + coord.y * this.dimensions.x);
    }

    private object(coord: Point): Tile | undefined {
        for (const object of this.objects.values()) {
            if (object.graphic.position.equals(coord)) return object;
        }
        return undefined;
    }

    private entity(coord: Point): Tile | undefined {
        let tile = this.object(coord);
        if (tile === undefined && this.player !== undefined && this.player.graphic.position.equals(coord))
            tile = this.player;
        if (tile === undefined) tile = this.tile(coord);
        return tile;
    }

    private updateVision(): void {
        if (this.player === undefined) return;

        this.visibles.forEach((coord) => {
            this.object(coord)?.graphic.hide();
            this.tile(coord)?.graphic.hide();
        });

        if (!properties.getBool('reveal-tiles')) {
            if (!properties.getBool('map-tiles')) this.visibles.length = 0;
            unveilRoom(
                this.player.graphic.position,
                this.isBlocking.bind(this),
                this.markVisible.bind(this),
                this.isVisible.bind(this),
                Infinity
            );
        }
        this.visibles.forEach((coord) => {
            this.object(coord)?.graphic.fade();
            this.tile(coord)?.graphic.fade();
        });

        this.lits.length = 0;
        computeFov(
            this.player.graphic.position,
            this.isBlocking.bind(this),
            this.markLit.bind(this),
            properties.getNumber('vision-distance')
        );
        this.lits.forEach((coord) => {
            this.object(coord)?.graphic.show();
            this.tile(coord)?.graphic.show();
        });
    }

    private readonly visibles = new Array<Point>();
    private readonly lits = new Array<Point>();

    private markVisible(coord: Point): void {
        this.visibles.push(coord);
    }

    private isVisible(coord: Point): boolean {
        return this.visibles.find((c: Point) => {
            return c.equals(coord);
        }) !== undefined;
    }

    private markLit(coord: Point): void {
        this.lits.push(coord);
    }

    private isBlocking(coord: Point): boolean {
        if (this.outOfBounds(coord)) return true;

        const tile = this.object(coord);
        if (tile === undefined) return false;

        return tile.blocksView;
    }

    private outOfBounds(coord: Point): boolean {
        return coord.x < 0 || coord.x > this.dimensions.x
            || coord.y < 0 || coord.y > this.dimensions.y;
    }
}
