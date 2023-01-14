import { Sprite } from 'pixi.js';
import tilesData from './tiles.json';

type TileData = {
    name: string;
    image: string;
};

export class Tile {
    private readonly data: TileData|null = null;
    public sprite: Sprite|null = null;

    constructor(name: string = "") {
        if (name.length == 0) return;
        for (const tile of (tilesData as TileData[])) {
            if (tile.name == name) {
                this.data = tile;
            }
        }
    }

    public get image(): string|undefined {
        return this.data?.image;
    }
}

export class EmptyTile extends Tile {

}

export class LastTile extends Tile {
    
}
