import { Sprite } from 'pixi.js';
import tilesData from './tiles.json';

interface TileData {
    name: string;
    image: string;
    symbol: string;
    action: string;
};

export class Tile {
    private readonly data: TileData|undefined = undefined;
    public sprite: Sprite|undefined = undefined;
    public name: string = "";

    constructor(name: string = "") {
        if (name.length === 0) return;
        for (const tile of (tilesData as TileData[])) {
            if (tile.name === name) {
                this.name = name;
                this.data = tile;
            }
        }
    }

    public get image(): string|undefined {
        return this.data?.image;
    }

    private static _charMap: Map<string, string>|undefined;
    public static get charMap(): Map<string, string> {
        if (Tile._charMap === undefined) {
            Tile._charMap = new Map<string, string>();
            for (const tile of (tilesData as TileData[])) {
                Tile._charMap.set(tile.symbol, tile.name);
            }
        }
        return Tile._charMap;
    }
}
