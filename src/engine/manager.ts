import { Application, DisplayObject, Point } from 'pixi.js';
import input from './input';
import env from './environment';

class Manager {
    private static _instance: Manager;
    public static instance(): Manager {
        if (Manager._instance === undefined) {
            Manager._instance = new Manager();
        }
        return Manager._instance;
    }

    private readonly app: Application;
    private currentScene: IScene | undefined;

    private constructor() {
        this.app = new Application({
            view: document.getElementById('pixi-canvas') as HTMLCanvasElement,
            resizeTo: document.getElementById('pixi-content') as HTMLDivElement,
            resolution: window.devicePixelRatio,
            autoDensity: true,
            backgroundAlpha: 0,
            hello: true
        });
        this.app.ticker.maxFPS = 30;
        this.app.ticker.add(this.update);

        input.register();
        env.register();
    }

    public changeScene(newScene: IScene): void {
        if (!env.mobile) return;

        if (this.currentScene !== undefined) {
            this.app.stage.removeChild(this.currentScene);
            this.currentScene.destroy();
        }
        this.currentScene = newScene;
        this.app.stage.addChild(this.currentScene);
        input.changeScene(this.currentScene);
    }

    private update(framesPassed: number): void {
        if (this.currentScene !== undefined) {
            this.currentScene.update(framesPassed);
        }
    }
}
export const manager = Manager.instance();

export interface IScene extends DisplayObject {
    input: (position: Point, button?: string) => void;
    update: (framesPassed: number) => void;
}
