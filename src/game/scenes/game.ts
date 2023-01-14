import { Container } from "pixi.js";
import { IScene } from "../../manager";
import { TileMap } from "../entities/map";

export class GameScene extends Container implements IScene {
    private readonly tileMap: TileMap|null = null;
    
    constructor() {
        super();

        this.tileMap = new TileMap("test");
        this.addChild(this.tileMap);
        this.tileMap.load();
        this.tileMap.draw();
    }

    public update(framesPassed: number): void {

    }
}
