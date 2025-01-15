import { Ticker, TickerCallback } from 'pixi.js';
import { Tween } from '@tweenjs/tween.js';

class Animation {
    private static _instance: Animation;
    public static instance(): Animation {
        if (Animation._instance === undefined) {
            Animation._instance = new Animation();
        }
        return Animation._instance;
    }

    private readonly ticker: Ticker;

    private constructor() {
        this.ticker = new Ticker();
        this.ticker.maxFPS = 30;
        this.ticker.start();
    }

    public add(callback: (time: number) => void, context?: Tween<any>): void {
        this.ticker.add((ticker: Ticker): void => {
            callback.bind(context)(ticker.lastTime);
        }, this);
    }
}
const animation = Animation.instance();
export default animation;