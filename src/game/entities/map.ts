import { Container, Assets, Point } from 'pixi.js';
import { properties } from 'engine/properties';
import { utils } from 'engine/utils';
import { unveilRoom } from 'fast/fill';
import { findNext } from 'fast/find';
import { computeFov } from 'fast/fov';
import { Graphic, Light, LightSource, Port } from 'game/components';
import { dialog } from 'game/proxies/dialog';
import { MapData } from './mapdata';
import { Tile } from './tile';

export type PropertyNames = 'vision-distance' | 'map-tiles' | 'reveal-tiles';
properties.register('vision-distance', 2, 'radius around player where tiles are revealed'); // only high number to prevent infinite recursion
properties.register('map-tiles', false, 'revealed tiles stay visible on map');
properties.register('reveal-tiles', false, 'all tiles are revealed on map');

export class TileMap extends Container {
    private data!: MapData;
    private readonly tiles = new Array<Tile>();
    private readonly objects = new Array<Tile>();
    private readonly layers = new Array<Container>(2);

    public static readonly scale: number = 3.0;
    public static readonly tileDim: number = TileMap.scale * 16;

    public static changeMap: (level: string, spawn: string) => Promise<void>;

    private static player: Tile;

    private _highlight: Tile | undefined;

    private readonly _afterLoad = new Array<() => void>();
    private loaded = false;
    private attached = false;
    private spawnCoord?: Point;

    private readonly flatMaps = new Map<string, any[]>();
    
    public static random: () => number;

    constructor(name: string) {
        super();

        this.label = name;

        this.layers[0] = this.addChild(new Container()); // for tiles
        this.layers[1] = this.addChild(new Container()); // for objects
        this.layers[1].sortableChildren = true;

        Tile.map = this;
        TileMap.random = utils.randomGen(name);

        if (TileMap.player == undefined) {
            TileMap.player = new Tile('player', new Point());
        }

        this.registerChanges();
    }

    private afterLoad(callback?: () => void): void {
        if (callback == undefined) {
            this._afterLoad.forEach((cb) => {cb()});
            this._afterLoad.length = 0;
            this.loaded = true;
        } else if (this.loaded) {
            callback();
        } else {
            this._afterLoad.push(callback);
        }
    }

    private registerChanges(): void {
        properties.onChange('reveal-tiles', (revealTiles: boolean) => {
            this.afterLoad(() => {
                this.updateVision();
                this.updateLights();
            });
        });
    }

    public get dimensions(): Point {
        return this.data.dimensions;
    }

    public changeLater(level: string, spawn: string): void {
        this.afterMove(() => {
            if (!this.attached) return;
    
            if (!TileMap.available(level, spawn)) {
                console.error(`cannot change to level: ${level} ${spawn}`);
                return;
            }
            TileMap.changeMap(level, spawn);
        });
    };

    public static available(level: string, spawn?: string): boolean {
        const levelYaml = Assets.get(level);
        if (levelYaml == undefined) return false;

        if (spawn != undefined) {
            const levelData = new MapData(levelYaml);
            const foundSpawn = Array.from(levelData.key.values()).some((value) => value.entity == spawn);
            if (!foundSpawn) return false;
        }

        return true;
    }

    public async load(spawn: string): Promise<boolean> {
        const levelYaml = Assets.get(this.label);
        if (levelYaml == undefined) return false;
        this.data = new MapData(levelYaml);

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
                if (!tile.destroyed) {
                    this.objects.push(tile);
                    const child = this.layers[tile.graphic.layer].addChild(tile.graphic.sprite);
                    child.zIndex = currentCoord.y;
                }

                tileName = this.nextGround(currentCoord);
            }
            
            const groundTile = new Tile(tileName, currentCoord);
            this.layers[groundTile.graphic.layer].addChild(groundTile.graphic.sprite);
            this.tiles.push(groundTile);

            currentCoord.x++;
        }

        this._highlight = new Tile('frame', currentCoord);
        this.layers[1].addChild(this._highlight.graphic.sprite);

        this.spawnCoord = this.objects.find((object) => object.name == spawn)?.graphic.coord;
        if (this.spawnCoord != undefined) this.focusPos(TileMap.coordToPos(this.spawnCoord));

        this.afterLoad();

        return true;
    }

    public async attachPlayer(): Promise<void> {
        if (this.spawnCoord == undefined) return;

        if (TileMap.player.graphic.coord.equals(new Point(0, 0)))
            TileMap.player.graphic.coord = this.spawnCoord;
        this.objects.push(TileMap.player);
        const child = this.layers[1].addChild(TileMap.player.graphic.sprite);
        child.zIndex = this.spawnCoord.y;

        TileMap.player.graphic.onMove = this.focusPos.bind(this);
        await this.move(new Point(0, 0), TileMap.player);
        this.attached = true;
    }

    public detachPlayer(): void {
        const idx = this.objects.indexOf(TileMap.player);
        this.objects.splice(idx, 1);
        this.layers[1].removeChild(TileMap.player.graphic.sprite);
        TileMap.player.graphic.onMove = () => {};
        TileMap.player.graphic.coord = new Point(0, 0);
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
        const groundIdx = findNext(
            coord,
            this.groundMap(),
            this.dimensions,
            Infinity
        );
        const char = this.data.layout.at(groundIdx);
        if (char == undefined) return ground;
        const name = this.data.key.get(char)?.entity;
        if (name != undefined) ground = name;
        return ground;
    }

    private coordToIdx(coord: Point): number {
        return coord.x + coord.y * (this.dimensions.x + 1);
    }

    private idxToCoord(idx: number): Point {
        return new Point(
            idx % this.dimensions.x,
            Math.floor(idx / this.dimensions.x)
        );
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
                this._highlight.graphic.show(false);
            }
            return;
        }

        if (!this._highlight.graphic.visible) this._highlight.graphic.show();

        const nextCoordPos = TileMap.coordToPos(new Point(coord.x + 1, coord.y));
        dialog.tell(tile.info, nextCoordPos.add(offset));
    }

    public async move(direction: Point, actor = TileMap.player): Promise<boolean> {
        if (actor === undefined) return false;
        if (actor.moving) return false;

        const origin = this.entity(actor.graphic.coord);
        if (origin === undefined) return false;

        const target = this.entity(actor.graphic.coord.add(direction));
        if (target === undefined) return false;

        actor.moving = true;
        
        if (actor == TileMap.player && target.move.pass || direction.equals(new Point(0,0))) {
            this.updateVision(target.graphic.coord);
            this.updateLights(target.graphic.coord);
        }
        await target?.act(actor);
        await origin?.leave(actor);
        // this.updateOthers();

        actor.moving = false;

        this.afterMove();
        
        return true;
    }

    private readonly _afterMove = new Array<() => void>();
    public afterMove(callback?: () => void): void {
        if (callback == undefined) {
            this._afterMove.forEach((cb) => cb());
            this._afterMove.length = 0;
        } else {
            this._afterMove.push(callback);
        }
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
        if (tile === undefined && TileMap.player !== undefined && TileMap.player.graphic.coord.equals(coord))
            tile = TileMap.player;
        if (tile === undefined) tile = this.tile(coord);
        return tile;
    }

    private updateVision(origin: Point = TileMap.player.graphic.coord): void {
        if (TileMap.player === undefined) return;

        let visibleMap = this.visibleMap();
        if (properties.getBool('reveal-tiles')) {
            visibleMap.fill(true);
        } else if (!properties.getBool('map-tiles')) {
            visibleMap = this.visibleMap(true);
        }

        const unveiledRoom = unveilRoom(
            origin,
            this.blockMap(),
            this.dimensions,
            Infinity
        );
        visibleMap.forEach((_, idx) => {
            visibleMap[idx] ||= unveiledRoom[idx];
        });

        visibleMap.forEach((visible, idx) => {
            const coord = this.idxToCoord(idx);
            this.object(coord)?.graphic.show(visible);
            this.tile(coord)?.graphic.show(visible);

            const unveiled = unveiledRoom[idx];
            this.object(coord)?.graphic.unveil(unveiled);
            this.tile(coord)?.graphic.unveil(unveiled);    
        });
    }
    
    private lightSources(target: Point): LightSource[] {
        const lightObjects = this.objects.filter((object) => object.hasComponent(Light) && object.graphic.visible);
        const lightSources = lightObjects.map((object) => {
            const light = object.getComponent(Light);
            return {
                coord: object.graphic.coord,
                radius: light.radius
            };
        });
        if (TileMap.player != undefined) {
            lightSources.push({
                coord: target,
                radius: properties.getNumber('vision-distance')
            })
        }
        return lightSources;
    }

    private updateLights(target: Point = TileMap.player.graphic.coord): void {
        const lightMap = this.lightMap(true);
        for (const source of this.lightSources(target)) {
            const light = computeFov(
                source.coord,
                Array(this.blockMap.length).fill(false),
                this.dimensions,
                source.radius
            );
            lightMap.forEach((level, idx, map) => {
                if (light[idx] > 0 && light[idx] > level) map[idx] = light[idx];
            });
        }
        lightMap.forEach((level, idx) => {
            const coord = this.idxToCoord(idx);
            this.object(coord)?.graphic.light(level);
            this.tile(coord)?.graphic.light(level);
        });
    }

    private outOfBounds(coord: Point): boolean {
        return coord.x < 0 || coord.x > this.dimensions.x
            || coord.y < 0 || coord.y > this.dimensions.y;
    }

    private visibleMap(clear: boolean = false): boolean[] {
        if (!this.flatMaps.has('visible') || clear) {
            this.flatMaps.set('visible', Array(this.data.layout.length).fill(false));
        }
        return this.flatMaps.get('visible') as boolean[];
    }

    private lightMap(clear: boolean = false): number[] {
        if (!this.flatMaps.has('light') || clear) {
            this.flatMaps.set('light', Array(this.data.layout.length).fill(0.0));
        }
        return this.flatMaps.get('light') as number[];
    }

    private groundMap(refresh: boolean = false): boolean[] {
        if (refresh || !this.flatMaps.has('ground')) {
            const groundMap = Array(this.data.layout.length).fill(false);
            for (let idx = 0; idx < this.data.layout.length; idx++) {
                const char = this.data.layout.at(idx);
                if (char == undefined) continue;
                const name = this.data.key.get(char)?.entity;
                if (name == undefined || name == 'none') continue;
                const layer = Graphic.getLayer(name);
                if (layer == 0) groundMap[idx] = true;
            }
            this.flatMaps.set('ground', groundMap);
        }
        return this.flatMaps.get('ground') as boolean[];
    }

    private blockMap(refresh: boolean = false): boolean[] {
        if (refresh || !this.flatMaps.has('block')) {
            const nameMap = this.propertyMap(false, (tile: Tile) => {
                return tile.graphic.block;
            });
            this.flatMaps.set('block', nameMap);
        }
        return this.flatMaps.get('block') as boolean[];
    }

    private propertyMap<T>(defaultValue: T, extract: (tile: Tile) => T): T[] {
        const count = this.tiles.length;
        const map: T[] = Array(count).fill(defaultValue);
        for (const obj of this.objects) {
            const coord = obj.graphic.coord;
            map[coord.x + coord.y * this.dimensions.x] = extract(obj);
        }
        return map;
    }
}
