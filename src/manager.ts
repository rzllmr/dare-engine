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

    public get width(): number {
        return Math.max(document.documentElement.clientWidth, window.innerWidth);
    }

    public get height(): number {
        return Math.max(document.documentElement.clientHeight, window.innerHeight);
    }

    private constructor() {
        this.app = new Application({
            view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
            resolution: window.devicePixelRatio,
            resizeTo: window,
            autoDensity: true,
            backgroundColor: 0xffffff
        });
        this.app.ticker.add(this.update);
        document.body.addEventListener('keydown', (event: KeyboardEvent) => {
            if (this.currentScene !== undefined) this.currentScene.input(event.key);
        })
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
    input: (key: string) => void;
    update: (framesPassed: number) => void;
}
