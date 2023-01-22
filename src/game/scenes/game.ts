import { Container } from "pixi.js";
import { IScene } from "../../manager";
import { TileMap } from "../entities/map";

export class GameScene extends Container implements IScene {
    private readonly tileMap: TileMap;
    
    constructor() {
        super();

        this.tileMap = new TileMap("map.test");
        this.addChild(this.tileMap);
        this.tileMap.load();
        this.tileMap.draw();
    }

    public input(key: string): void {
        if (key.startsWith("Arrow")) {
            this.tileMap.moveObject("player", key.replace("Arrow", ""));
        }
    }

    public update(framesPassed: number): void {

    }
}
