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
    private startTime!: number;

    constructor(tween: Tween) {
        this.tween = tween;
    }

    public run(): Promise<void> {
        this.startTime = Animation.ticker.lastTime;
        return new Promise((resolve) => {
            const updateTween = (ticker: Ticker): void => {
                this.tween.update(ticker.lastTime);
            }
            const resolveAnimation = (): void => {
                Animation.ticker.remove(updateTween);
                resolve();
            }
            Animation.ticker.add(updateTween);
            this.tween.onComplete(resolveAnimation);
            this.tween.onStop(resolveAnimation);
            this.tween.start();
        });
    }

    public skip(): void {
        this.tween.update(this.startTime + this.tween.getDuration() + 1000);
        this.tween.stop();
    }

    public running(): boolean {
        return this.tween.isPlaying();
    }

    public static fade(element: HTMLElement, duration: number): Animation {
        const tween = new Tween({p: 0}).to({p: 1}).duration(duration).onUpdate((obj) => {
            element.style.opacity = (1 - obj.p).toString();
        });
        return new Animation(tween);
    }
}
