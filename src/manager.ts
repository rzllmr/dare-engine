import { Application, DisplayObject, Point } from 'pixi.js';
import input from './input';

class Manager {
    private static _instance: Manager;
    public static instance(): Manager {
        if (Manager._instance === undefined) {
            Manager._instance = new Manager();
        }
        return Manager._instance;
    }

    private readonly app: Application;
    private readonly mobile: boolean;
    private currentScene: IScene | undefined;
    private scale = 1.0;

    public get width(): number {
        return Math.max(document.documentElement.clientWidth, window.innerWidth);
    }

    public get height(): number {
        return Math.max(document.documentElement.clientHeight, window.innerHeight);
    }

    private constructor() {
        this.app = new Application({
            view: document.getElementById('pixi-canvas') as HTMLCanvasElement,
            resolution: window.devicePixelRatio,
            resizeTo: document.getElementById('pixi-content') as HTMLDivElement,
            autoDensity: true,
            backgroundAlpha: 0,
            hello: true
        });
        this.app.ticker.maxFPS = 30;
        // this.app.ticker.add(this.update);

        this.mobile = this.detectMobile();
        input.register();

        const deskDiv = document.querySelector('#desk') as HTMLDivElement;
        window.onload = () => {
            window.dispatchEvent(new Event('resize'));
        };
        window.onresize = () => {
            this.scale = Math.min( 
                window.innerWidth / deskDiv.offsetWidth, 
                window.innerHeight / deskDiv.offsetHeight
            );
            deskDiv.style.transform = `scale(${this.scale}`;
            input.changeScale(this.scale);
        };
    }

    public changeScene(newScene: IScene): void {
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
