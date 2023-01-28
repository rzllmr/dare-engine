import { Sprite } from 'pixi.js';
import tilesData from './tiles.json';

interface TileData {
    name: string;
    image: string;
    symbol: string;
    action: string;
}

export class Tile {
    private readonly data: TileData | undefined = undefined;
    public sprite: Sprite | undefined = undefined;
    public name: string = '';

    constructor(name: string = '') {
        if (name.length === 0) return;
        for (const tile of tilesData as TileData[]) {
            if (tile.name === name) {
                this.name = name;
                this.data = tile;
            }
        }
    }

    public get image(): string | undefined {
        return this.data?.image;
    }

    public get action(): string | undefined {
        return this.data?.action;
    }

    public show(): void {
        if (this.sprite === undefined) return;
        this.sprite.alpha = 1.0;
    }

    public hide(): void {
        if (this.sprite === undefined) return;
        this.sprite.alpha = 0.3;
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
