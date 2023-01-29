import { Point, Sprite, Texture } from 'pixi.js';
import { Entity } from '../../entity';
import { Action, Move, Pick } from './actions';
import { TileMap } from './map';
import tilesData from './tiles.json';
import properties from '../../properties';
import { Inventory } from './components';

export type PropertyNames = 'map-tiles' | 'reveal-tiles';
properties.register('map-tiles', false, 'revealed tiles stay visible on map');
properties.register('reveal-tiles', false, 'all tiles are revealed on map');

interface TileData {
    name: string;
    image: string;
    symbol: string;
    kind: string;
    specific: string;
}

export class Tile extends Entity {
    private readonly data!: TileData;
    public readonly sprite!: Sprite;
    private alpha = {
        start: properties.getBool('reveal-tiles') ? 0.3 : 0.0,
        show: 1.0,
        hide: properties.getBool('map-tiles') ? 0.3 : 0.0
    };

    constructor(name: string, position: Point, specific: string = '') {
        super();

        const tileData = (tilesData as TileData[]).find((tile) => {
            return tile.name === name;
        });
        if (tileData === undefined) throw new Error(`tile name unknown: ${name}`);

        this.data = tileData;
        this.initKind(this.kind, specific);
        this.sprite = this.loadSprite(this.data.image);
        this.position = position;

        this.registerChanges();
    }

    private registerChanges(): void {
        properties.onChange('map-tiles', () => {
            this.alpha.hide = properties.getBool('map-tiles') ? 0.3 : 0.0;
        });
    }

    private initKind(kind: string, specific: string): void {
        switch (kind) {
            case 'player':
                this.alpha = { start: 1.0, show: 1.0, hide: 0.3 };
                this.addComponent(new Inventory());
                break;
            case 'enemy':
                this.alpha = { start: 0.0, show: 1.0, hide: 0.0 };
                break;
            case 'item':
                this.alpha = { start: 0.0, show: 1.0, hide: 0.0 };
                this.addComponent(new Pick(specific));
                this.addComponent(new Move());
                break;
            case 'pass':
                this.addComponent(new Move());
                break;
            case 'door':
                this.addComponent(new Move());
                break;
            case 'chasm':
                break;
            case 'block':
                break;
            default:
                console.error(`unknown kind: ${kind}`);
        }
    }

    public get blocksView(): boolean {
        return ['block', 'door'].includes(this.kind);
    }

    public act(subject: Tile): void {
        for (const component of this.components) {
            if (component instanceof Action) {
                component.act(subject);
            }
        }
    }

    public get name(): string {
        return this.data.name;
    }

    public get symbol(): string {
        return this.data.symbol;
    }

    public get image(): string {
        return this.data.image;
    }

    public get kind(): string {
        return this.data.kind;
    }

    public show(): void {
        this.sprite.alpha = this.alpha.show;
    }

    public hide(): void {
        this.sprite.alpha = this.alpha.hide;
    }

    public get position(): Point {
        return new Point(Math.round(this.sprite.x / TileMap.tileDim), Math.round(this.sprite.y / TileMap.tileDim));
    }

    public set position(value: Point) {
        this.sprite.x = value.x * TileMap.tileDim;
        this.sprite.y = value.y * TileMap.tileDim;
    }

    private loadSprite(image: string): Sprite {
        const sprite = Sprite.from(Tile.loadTexture(image));
        sprite.scale.set(TileMap.scale);
        sprite.anchor.set(0.0);
        sprite.alpha = this.alpha.start;
        return sprite;
    }

    private static readonly textures = new Map<string, Texture>();
    private static loadTexture(image: string): Texture {
        let texture = Tile.textures.get(image);
        if (texture === undefined) {
            texture = Texture.from(image);
            Tile.textures.set(image, texture);
        }
        return texture;
    }

    private static _charMap: Map<string, TileData> | undefined;
    public static get charMap(): Map<string, TileData> {
        if (Tile._charMap === undefined) {
            Tile._charMap = new Map<string, TileData>();
            for (const tile of tilesData as TileData[]) {
                Tile._charMap.set(tile.symbol, tile);
            }
        }
        return Tile._charMap;
    }
}
