import { Ticker } from 'pixi.js';
import { Tween } from '@tweenjs/tween.js';

export class Animation {
    private static _ticker: Ticker;
    private static get ticker(): Ticker {
        if (Animation._ticker === undefined) {
            Animation._ticker = new Ticker();
            Animation._ticker.maxFPS = 30;
            Animation._ticker.start();
        }
        return Animation._ticker;
    }

    private readonly tween: Tween;

    constructor(tween: Tween) {
        this.tween = tween;
    }

    public run(): Promise<void> {
        return new Promise((resolve) => {
            const updateCb = (ticker: Ticker): void => {
                this.tween.update(ticker.lastTime);
            }
            const completeCb = (): void => {
                Animation.ticker.remove(updateCb);
                resolve();
            }
            Animation.ticker.add(updateCb);
            this.tween.onComplete(completeCb);
            this.tween.start();
        });
    }

    public static fade(element: HTMLElement, duration: number): Animation {
        const tween = new Tween({p: 0}).to({p: 1}).duration(duration).onUpdate((obj) => {
            element.style.opacity = (1 - obj.p).toString();
        });
        return new Animation(tween);
    }
}
