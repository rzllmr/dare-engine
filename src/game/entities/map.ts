import { Container, Assets, Point } from 'pixi.js';
import { Tile } from './tile';
import computeFov from '../../fov';
import properties from '../../properties';
import info from '../../info';
import { readMap } from '../../schemes';
import dialog from '../proxies/dialog';

export type PropertyNames = 'vision-distance' | 'map-tiles' | 'reveal-tiles';
properties.register('vision-distance', 1, 'radius around player where tiles are revealed'); // only high number to prevent infinite recursion
properties.register('map-tiles', false, 'revealed tiles stay visible on map');
properties.register('reveal-tiles', false, 'all tiles are revealed on map');

export class TileMap extends Container {
    private readonly tiles = new Array<Tile>();
    private readonly movables = new Array<Tile>();
    private readonly layers = new Array<Container>(2);
    private readonly dimensions = new Point(0, 0);

    public static readonly scale: number = 3.0;
    public static readonly tileDim: number = TileMap.scale * 16;

    public player: Tile | undefined;
    private _highlight: Tile | undefined;
    private moving = false;

    constructor(name: string) {
        super();

        this.name = name;

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
        const data = readMap(Assets.get(this.name));
        const layout = data.layout.replace(/(.) /gm, '$1').replace(/^\n/, '');

        this.checkMapDimensions(layout);
        Tile.removeFromMap = this.remove.bind(this);

        const currentPosition = new Point(0, 0);
        for (const char of layout) {
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

                let tile = new Tile(tileName, currentPosition);

                if (['player', 'enemy', 'item'].includes(tile.kind)) {
                    if (tile.kind === 'player') {
                        this.player = tile;
                    } else {
                        this.movables.push(tile);
                    }
                    this.layers[1].addChild(tile.graphic.sprite);
                    tileName = 'ground';
                    tile = new Tile(tileName, currentPosition);
                }

                this.tiles.push(tile);
                this.layers[0].addChild(tile.graphic.sprite);
                currentPosition.x++;
            }
        }

        this._highlight = new Tile('frame', currentPosition);
        this.layers[1].addChild(this._highlight.graphic.sprite);

        this.updateVision();
        if (this.player !== undefined) this.focusCoord(this.player.graphic.position);
    }

    private posToCoord(position: Point): Point {
        position = new Point(position.x - TileMap.tileDim / 2, position.y - TileMap.tileDim / 2);
        return new Point(Math.round(position.x / TileMap.tileDim), Math.round(position.y / TileMap.tileDim));
    }

    private coordToPos(coord: Point): Point {
        return new Point(coord.x * TileMap.tileDim, coord.y * TileMap.tileDim);
    }

    public highlight(position: Point, offset: Point): void {
        position = new Point(position.x - offset.x, position.y - offset.y);
        if (this._highlight === undefined) return;

        const coord = this.posToCoord(position);
        if (this._highlight.graphic.position.equals(coord)) return;
        this._highlight.graphic.position = coord;

        const tile = this.entity(coord);
        if (tile === undefined || !tile.graphic.visible) {
            if (this._highlight.graphic.visible) {
                this._highlight.graphic.hide();
                info.tell('Nothing specific.');
                dialog.tell('');
            }
            return;
        }

        if (!this._highlight.graphic.visible) this._highlight.graphic.show();
        info.tell(tile.info);

        const nextCoordPos = this.coordToPos(new Point(coord.x + 1, coord.y));
        dialog.tell(tile.info, new Point(nextCoordPos.x + offset.x, nextCoordPos.y + offset.y));
    }

    public move(name: string, direction: Point): boolean {
        if (this.moving) return false;

        const movable = name === 'player' ? this.player : this.movables.find((movable) => movable.name === name);
        if (movable === undefined) return false;

        const targetCoord = new Point(
            movable.graphic.position.x + direction.x,
            movable.graphic.position.y + direction.y
        );
        let target = this.movable(targetCoord);
        if (target === undefined) target = this.tile(targetCoord);
        if (target === undefined) return false;

        this.focusCoord(targetCoord);

        this.moving = true;
        target.act(movable)
        //  .then(() => {this.updateOthers()})
            .then(() => {this.updateVision()})
            .then(() => {this.moving = false})
            .catch((msg) => {console.error(msg)});
        
        return true;
    }

    public focusCoord(coord: Point): void {
        const view = document.getElementById('pixi-content') as HTMLDivElement;

        const playerPos = this.coordToPos(coord);
        const cameraPos = new Point(
            view.offsetWidth / 2 - playerPos.x - TileMap.tileDim / 2,
            view.offsetHeight / 2 - playerPos.y - TileMap.tileDim / 2,
        );
        this.pivot.x = -cameraPos.x;
        this.pivot.y = -cameraPos.y;
    }

    public remove(tile: Tile): void {
        this.layers[1].removeChild(tile.graphic.sprite);
        const idx = this.movables.indexOf(tile);
        if (idx > -1) this.movables.splice(idx, 1);
    }

    private tile(coord: Point): Tile | undefined {
        if (coord.x >= this.dimensions.x) return undefined;
        return this.tiles.at(coord.x + coord.y * this.dimensions.x);
    }

    private movable(coord: Point): Tile | undefined {
        for (const movable of this.movables.values()) {
            if (movable.graphic.position.x === coord.x && movable.graphic.position.y === coord.y) return movable;
        }
        return undefined;
    }

    private entity(coord: Point): Tile | undefined {
        let tile = this.movable(coord);
        if (tile === undefined && this.player !== undefined && this.player.graphic.position.equals(coord))
            tile = this.player;
        if (tile === undefined) tile = this.tile(coord);
        return tile;
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
