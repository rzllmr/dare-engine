import { Application, Container, Point, Ticker } from 'pixi.js';
import 'pixi.js/math-extras';
import 'extensions/point';
import { env } from './environment';
import { input } from './input';

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
        this.app = new Application();
    }

    public init(): Promise<void> {
        return this.app
            .init({
                canvas: document.getElementById('pixi-canvas') as HTMLCanvasElement,
                resizeTo: document.getElementById('pixi-content') as HTMLDivElement,
                resolution: window.devicePixelRatio,
                autoDensity: true,
                backgroundAlpha: 0,
                hello: true
            })
            .then(() => {
                this.app.ticker.maxFPS = 30;
                this.app.ticker.add(this.update);

                input.register();
                env.register();
            });
    }

    public async changeScene(newScene: IScene): Promise<void> {
        if (!env.portrait) return;

        await newScene.load();
        if (this.currentScene !== undefined) {
            this.app.stage.removeChild(this.currentScene);
            this.currentScene.destroy();
        }
        this.currentScene = newScene;
        this.app.stage.addChild(this.currentScene);
        input.attach(this.currentScene);
    }

    private update(ticker: Ticker): void {
        if (this.currentScene !== undefined) {
            this.currentScene.update(ticker.lastTime);
        }
    }
}
export const manager = Manager.instance();

export interface IScene extends Container {
    load: () => Promise<void>;
    input: (position: Point, button?: string) => void;
    update: (lastTime: number) => void;
}
