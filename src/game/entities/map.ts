import { Container, Sprite, Texture, Assets, Point } from 'pixi.js';
import { Creature, Player } from './player';
import { Tile } from './tile'

export class TileMap extends Container {
    private readonly data: string = "";
    private readonly tiles = new Array<Tile>();
    private readonly objects = new Map<string, Creature>();
    private readonly layers = new Array<Container>(2).fill(new Container());
    private dimX: number = 0;
    private dimY: number = 0;
    private tileDim: number = 0;
    public player: Player|undefined;

    private static readonly textures = new Map<string, Texture>();

    public static availableMaps(): string[] {
        return ['test'];
    }

    constructor(name: string) {
        super();

        this.name = name;
        this.data = Assets.get(name) as string;
        this.layers.forEach(layer => this.addChild(layer));
    }

    private tile(x: number, y: number): Tile | undefined {
        return this.tiles.at(x + y * (this.dimX + 1));
    }

    public load(): TileMap {
        if (this.data.length === 0) return this;
        
        const mapData: string = this.data.replace(/(.) /gm, "$1");

        let width = 0;
        for (const char of mapData) {
            if (char === "\n") {
                if (width > this.dimX) this.dimX = width;
                this.dimY++;
                width = 0;
            } else {
                width++;
            }
        }

        let currentX = 0;
        let currentY = 0;
        for (const char of mapData) {
            if (char === "\n") {
                const fillUp = Array(this.dimX - currentX).fill(new Tile("chasm"), 0);
                this.tiles.concat(fillUp);
                currentX = 0;
                currentY++;
            } else {
                let tileName = Tile.charMap.get(char);
                if (tileName === undefined) tileName = "chasm";
                if (tileName === "player") {
                    if (this.player === undefined) {
                        const player = new Player(currentX, currentY);
                        this.objects.set(tileName, player);
                        this.player = player;
                    } else {
                        console.warn(`Player '@' already defined in ${this.name}:${this.player.posY + 1}:${this.player.posX + 1}`);
                    }
                    tileName = "ground";
                }
                const tile = new Tile(tileName);
                this.tiles.push(tile);
                currentX++;
            }
        }

        return this;
    }

    public draw(): TileMap {
        const scale = 0.1;
        let offsetX = 0;
        let offsetY = 0;
        this.tileDim = 128 * scale;
        for (let idx = 0; idx < this.tiles.length; idx++) {
            if (idx % this.dimX === 0) {
                offsetY += this.tileDim;
                offsetX = 0;
            }

            const tile = this.tiles[idx];
            
            if (tile.image === undefined) continue;

            let texture = TileMap.textures.get(tile.image);
            if (texture === undefined) {
                texture = Texture.from(tile.image);
                TileMap.textures.set(tile.image, texture);
            }

            tile.sprite = Sprite.from(texture);

            tile.sprite.scale.set(scale, scale);
            tile.sprite.anchor.set(0.0);
            tile.sprite.x = offsetX;
            tile.sprite.y = offsetY;
            this.layers[0].addChild(tile.sprite);

            offsetX += this.tileDim;
        }

        for (const object of this.objects.values()) {
            if (object.image === undefined) continue;

            let texture = TileMap.textures.get(object.image);
            if (texture === undefined) {
                texture = Texture.from(object.image);
                TileMap.textures.set(object.image, texture);
            }
            object.sprite = Sprite.from(texture);

            object.sprite.scale.set(scale);
            object.sprite.anchor.set(0.0);
            object.sprite.x = object.posX * this.tileDim;
            object.sprite.y = object.posY * this.tileDim;
            this.layers[1].addChild(object.sprite);
        }

        return this;
    }

    public moveObject(name: string, direction: string): void {
        const object = this.objects.get(name);
        if (object?.sprite === undefined) return;

        const movement = new Point(0, 0);
        switch(direction) {
            case "Up":
                movement.y = -this.tileDim;
                break;
            case "Down":
                movement.y = this.tileDim;
                break;
            case "Left":
                movement.x = -this.tileDim;
                break;
            case "Right":
                movement.x = this.tileDim;
                break;
        }
        
        object.sprite.x += movement.x;
        object.sprite.y += movement.y;  
    }
}
