import { Container, Assets, Point } from 'pixi.js';
import { properties } from 'engine/properties';
import { storage } from 'engine/storage';
import { unveilRoom } from 'fast/fill';
import { findNext } from 'fast/find';
import { computeFov } from 'fast/fov';
import { Graphic } from 'game/components';
import { dialog } from 'game/proxies/dialog';
import { MapData } from './mapdata';
import { Tile } from './tile';

export type PropertyNames = 'vision-distance' | 'map-tiles' | 'reveal-tiles';
properties.register('vision-distance', 1, 'radius around player where tiles are revealed'); // only high number to prevent infinite recursion
properties.register('map-tiles', false, 'revealed tiles stay visible on map');
properties.register('reveal-tiles', false, 'all tiles are revealed on map');

export class TileMap extends Container {
    private data!: MapData;
    private readonly tiles = new Array<Tile>();
    private readonly objects = new Array<Tile>();
    private readonly layers = new Array<Container>(2);

    public static readonly scale: number = 3.0;
    public static readonly tileDim: number = TileMap.scale * 16;

    public player: Tile | undefined;
    private _highlight: Tile | undefined;

    constructor(name: string) {
        super();

        this.label = name;

        this.layers[0] = this.addChild(new Container()); // for tiles
        this.layers[1] = this.addChild(new Container()); // for objects
        this.layers[1].sortableChildren = true;

        Tile.map = this;

        this.registerChanges();
    }

    private registerChanges(): void {
        properties.onChange('reveal-tiles', (revealTiles: boolean) => {
            this.visibles.length = 0;
            if (revealTiles) {
                this.tiles.forEach((tile) => {
                    this.visibles.push(tile.graphic.coord);
                });
            }
            this.updateVision();
        });
    }

    public get dimensions(): Point {
        return this.data.dimensions;
    }

    public async load(): Promise<void> {
        this.data = new MapData(Assets.get(this.label as string));

        const currentCoord = new Point(0, 0);
        for (let idx = 0; idx < this.data.layout.length; idx++) {
            const char = this.data.layout[idx];
            if (char === '\n') {
                while (currentCoord.x < this.dimensions.x) {
                    const tile = new Tile('none', currentCoord);
                    this.layers[0].addChild(tile.graphic.sprite);
                    this.tiles.push(tile);
                    currentCoord.x++;
                }
                currentCoord.x = 0;
                currentCoord.y++;
                continue;
            }

            let tileName = 'none';
            const keyEntry = this.data.key.get(char);
            if (keyEntry === undefined) {
                if (idx > 0) console.error(`map symbol unknown: ${char}`);
            } else {
                tileName = keyEntry.entity;
            }

            const tile = new Tile(tileName, currentCoord, keyEntry?.details);

            if (tile.graphic.layer > 0) {
                if (tile.kind === 'player') {
                    this.player = tile;
                    this.player.graphic.coord = storage.load('player-coord', currentCoord) as Point;
                } else {
                    this.objects.push(tile);
                }

                const child = this.layers[tile.graphic.layer].addChild(tile.graphic.sprite);
                child.zIndex = currentCoord.y;

                tileName = this.nextGround(currentCoord);
            }
            
            const groundTile = new Tile(tileName, currentCoord);
            this.layers[groundTile.graphic.layer].addChild(groundTile.graphic.sprite);
            this.tiles.push(groundTile);

            currentCoord.x++;
        }

        this._highlight = new Tile('frame', currentCoord);
        this.layers[1].addChild(this._highlight.graphic.sprite);

        if (this.player === undefined) return;

        this.player.graphic.onMove = this.focusPos.bind(this);
        await this.move(new Point());

        dialog.tellStory('intro', 'enter');
    }

    public surrounding(coord: Point): string[] {
        const idx = this.coordToIdx(coord);
        const surrounding: string[] = [];
        for (let y = -1; y <= 1; y++) {
            for (let x = -1; x <= 1; x++) {
                const char = this.data.layout[idx + ((this.dimensions.x + 1) * y) + x];
                const name = this.data.key.get(char)?.entity || '';
                surrounding.push(name);
            }
        }
        return surrounding;
    }

    private nextGround(coord: Point): string {
        let ground = 'none';
        const match = (coord: Point): boolean => {
            const char = this.data.layout.at(this.coordToIdx(coord));
            if (char == undefined) return false;
            const name = this.data.key.get(char)?.entity;
            if (name == undefined) return false;
            const layer = Graphic.getLayer(name);
            if (layer == 0) {
                ground = name;
                return true;
            }
            return false;
        };
        const ignore = (coord: Point): boolean => {
            return this.outOfBounds(coord);
        }
        findNext(coord, match, ignore);
        return ground;
    }

    private coordToIdx(coord: Point): number {
        return coord.x + coord.y * (this.dimensions.x + 1);
    }

    public static posToCoord(position: Point): Point {
        position = new Point(position.x - TileMap.tileDim / 2, position.y - TileMap.tileDim / 2);
        return position.multiplyScalar(1 / TileMap.tileDim).round();
    }

    public static coordToPos(coord: Point): Point {
        return coord.multiplyScalar(TileMap.tileDim);
    }

    public highlight(position: Point, offset: Point): void {
        position = position.subtract(offset).add(this.pivot);
        if (this._highlight === undefined) return;

        const coord = TileMap.posToCoord(position);
        if (this._highlight.graphic.coord.equals(coord)) return;
        this._highlight.graphic.coord = coord;

        const tile = this.entity(coord);
        if (tile === undefined || !tile.graphic.visible) {
            if (this._highlight.graphic.visible) {
                this._highlight.graphic.hide();
            }
            return;
        }

        if (!this._highlight.graphic.visible) this._highlight.graphic.show();

        const nextCoordPos = TileMap.coordToPos(new Point(coord.x + 1, coord.y));
        dialog.tell(tile.info, nextCoordPos.add(offset));
    }

    public async move(direction: Point, actor = this.player): Promise<boolean> {
        if (actor === undefined) return false;
        if (actor.moving) return false;

        const originCoord = actor.graphic.coord;
        let origin = this.object(originCoord);
        if (origin === undefined) origin = this.tile(originCoord);
        if (origin === undefined) return false;

        const targetCoord = actor.graphic.coord.add(direction);
        let target = this.object(targetCoord);
        if (target === undefined) target = this.tile(targetCoord);
        if (target === undefined) return false;

        actor.moving = true;
        
        await target?.act(actor);
        await origin?.leave(actor);
        // this.updateOthers();
        this.updateVision();

        if (actor == this.player) storage.save('player-coord', actor.graphic.coord);

        actor.moving = false;
                
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
            if (object.graphic.coord.equals(coord)) return object;
        }
        return undefined;
    }

    private entity(coord: Point): Tile | undefined {
        let tile = this.object(coord);
        if (tile === undefined && this.player !== undefined && this.player.graphic.coord.equals(coord))
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
                this.player.graphic.coord,
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
            this.player.graphic.coord,
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

        return tile.graphic.block;
    }

    private outOfBounds(coord: Point): boolean {
        return coord.x < 0 || coord.x > this.dimensions.x
            || coord.y < 0 || coord.y > this.dimensions.y;
    }
}
