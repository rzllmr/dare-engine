import { Point, Sprite, Texture } from 'pixi.js';
import { Entity } from '../../entity';
import { Action, Move } from './actions';
import { TileMap } from './map';
import tilesData from './tiles.json';

interface TileData {
    name: string;
    image: string;
    symbol: string;
    kind: string;
}

export class Tile extends Entity {
    private readonly data!: TileData;
    public readonly sprite!: Sprite;
    protected alpha = { start: 0.0, show: 1.0, hide: 0.3 };

    constructor(name: string, position: Point) {
        super();

        const tileData = (tilesData as TileData[]).find((tile) => {
            return tile.name === name;
        });
        if (tileData === undefined) throw new Error(`tile name unknown: ${name}`);

        this.data = tileData;
        this.initKind(this.kind);
        this.sprite = this.loadSprite(this.data.image);
        this.position = position;
    }

    private initKind(kind: string): void {
        switch (kind) {
            case 'player':
                this.alpha = { start: 1.0, show: 1.0, hide: 0.3 };
                break;
            case 'enemy':
                this.alpha = { start: 0.0, show: 1.0, hide: 0.0 };
                break;
            case 'item':
                this.alpha = { start: 0.0, show: 1.0, hide: 0.0 };
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
            (component as Action).act(subject);
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
