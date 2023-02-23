import { Application, DisplayObject, Point } from 'pixi.js';

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
    private mousePos = new Point(0, 0);

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
            resizeTo: window,
            autoDensity: true,
            backgroundAlpha: 0,
            hello: true
        });
        this.app.ticker.maxFPS = 30;
        // this.app.ticker.add(this.update);

        const pixiDiv = document.querySelector('#pixi-content') as HTMLDivElement;
        document.body.addEventListener('keydown', (event: KeyboardEvent) => {
            this.currentScene?.input(this.mousePos, event.key);
        });
        pixiDiv.addEventListener('mousemove', (event: MouseEvent) => {
            this.mousePos = new Point(event.pageX, event.pageY);
            this.currentScene?.input(this.mousePos);
        });
        const mouseButton = ['LeftClick', 'MiddleClick', 'RightClick'];
        pixiDiv.addEventListener('mousedown', (event: MouseEvent) => {
            this.currentScene?.input(this.mousePos, mouseButton[event.button]);
        });
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
export const manager = Manager.instance();

export interface IScene extends DisplayObject {
    input: (position: Point, button?: string) => void;
    update: (framesPassed: number) => void;
}
