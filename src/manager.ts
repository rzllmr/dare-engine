import { Application, DisplayObject } from "pixi.js";

class Manager {
    private static _instance: Manager;
    public static instance(): Manager {
        if (Manager._instance === undefined) {
            Manager._instance = new Manager();
        }

        return Manager._instance;
    }

    private readonly app: Application;
    private currentScene: IScene|undefined;

    private readonly _width: number = 640;
    private readonly _height: number = 480;

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    private constructor() {
        this.app = new Application({
            view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
            resolution: window.devicePixelRatio,
            autoDensity: true,
            backgroundColor: 0x6495ed,
            width: this._width,
            height: this._height
        });
        this.app.ticker.add(this.update)
    }

    public changeScene(newScene: IScene): void {
        if (this.currentScene !== undefined) {
            this.app.stage.removeChild(this.currentScene);
            this.currentScene.destroy();
        }
        this.currentScene = newScene;
        this.app.stage.addChild(this.currentScene);
    }

    private update(framesPassed: number): void {
        if (this.currentScene !== undefined) {
            this.currentScene.update(framesPassed);
        }
    }
}
export const manager = Manager.instance()

export interface IScene extends DisplayObject {
    update: (framesPassed: number) => void;
}
