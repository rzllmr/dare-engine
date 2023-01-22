import { Container, Sprite, Texture, Assets, Point } from 'pixi.js';
import { Movable, Player, Movement } from './movable';
import { Tile } from './tile'

export class TileMap extends Container {
    private readonly data: string = "";
    private readonly tiles = new Array<Tile>();
    private readonly movables = new Map<string, Movable>();
    private readonly layers = new Array<Container>(2).fill(new Container());
    private dimX: number = 0;
    private dimY: number = 0;

    private static readonly scale: number = 0.1;
    private static readonly tileDim: number = TileMap.scale * 128;

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
                        this.movables.set(tileName, player);
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
        let offsetX = 0;
        let offsetY = 0;
        for (let idx = 0; idx < this.tiles.length; idx++) {
            if (idx % this.dimX === 0) {
                offsetY++;
                offsetX = 0;
            }

            const tile = this.tiles[idx];            
            TileMap.initSprite(tile, offsetX, offsetY);
            if (tile.sprite !== undefined) this.layers[0].addChild(tile.sprite);

            offsetX++;
        }

        for (const movable of this.movables.values()) {
            TileMap.initSprite(movable, movable.posX, movable.posY);
            if (movable.sprite !== undefined) this.layers[1].addChild(movable.sprite);
        }

        return this;
    }

    private static initSprite(tile: Tile, posX: number, posY: number): void {
        if (tile.image === undefined) return;

        const texture = TileMap.texture(tile.image);
        tile.sprite = Sprite.from(texture);

        tile.sprite.scale.set(TileMap.scale);
        tile.sprite.anchor.set(0.0);
        tile.sprite.x = posX * TileMap.tileDim;
        tile.sprite.y = posY * TileMap.tileDim;
    }

    private static texture(image: string): Texture {
        let texture = TileMap.textures.get(image);
        if (texture === undefined) {
            texture = Texture.from(image);
            TileMap.textures.set(image, texture);
        }
        return texture;
    }

    public move(name: string, movement: Movement): void {
        const direction = movement.direction;
        if (direction === undefined) return;

        const object = this.movables.get(name);
        if (object?.sprite === undefined) return;

        const target = this.tile(
            object.posX + direction.x,
            object.posY + direction.y - 1
        );

        if (target?.action === "block") return;

        object.posX += direction.x;
        object.posY += direction.y;
        object.sprite.x += direction.x * TileMap.tileDim;
        object.sprite.y += direction.y * TileMap.tileDim;
    }

    private tile(x: number, y: number): Tile | undefined {
        return this.tiles.at(x + y * this.dimX);
    }
}
