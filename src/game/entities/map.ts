import { Container, Sprite, Assets } from 'pixi.js';
import { Manager } from '../../manager';
import { Tile, EmptyTile, LastTile } from './tile'

export class TileMap extends Container {
    private data: string = "";
    private tiles = new Array<Tile>();
    private tileName: Map<string, string> = new Map([
        ["≈", "sea"],
        ["\"", "grass"],
        ["♣", "forest"]
    ]);

    public static availableMaps(): string[] {
        return ['test'];
    }

    constructor(name: string) {
        super();

        this.data = Assets.get('map') as string;
    }

    public load(): TileMap {
        if (this.data.length == 0) return this;

        for (const char of this.data) {
            let tile: Tile = new EmptyTile();
            if (char == "\n") tile = new LastTile();
            else {
                const tileName = this.tileName.get(char);
                if (tileName != undefined) tile = new Tile(tileName);
            }
            this.tiles.push(tile);
        }

        return this;
    }

    public draw(): TileMap {
        let offsetX = 0;
        let offsetY = 0;
        let spacingX = 16;
        for (let idx = 0; idx < this.tiles.length; idx++) {
            const tile = this.tiles[idx];
            if (tile instanceof EmptyTile) offsetX += spacingX;
            else if (tile instanceof LastTile) {
                offsetY += 24;
                offsetX = 0;
                spacingX = 16;
            } else {
                spacingX = 32;
            }

            if (tile.image == undefined) continue;

            tile.sprite = Sprite.from(tile.image);

            tile.sprite.scale.set(2, 2);
            tile.sprite.anchor.set(0.5);
            tile.sprite.x = Manager.width / 2 + offsetX;
            tile.sprite.y = Manager.height / 2 + offsetY;
            this.addChild(tile.sprite);
        }
        return this;
    }
}
