import { Point } from "pixi.js";

class Utils {
    private static _instance: Utils;
    public static instance(): Utils {
        if (Utils._instance === undefined) {
            Utils._instance = new Utils();
        }
        return Utils._instance;
    }

    public elementOffset(element: HTMLElement | null): Point {
        if (element == null) return new Point();
        
        const offset = this.elementOffset(element.parentElement);
        offset.x += element.offsetLeft;
        offset.y += element.offsetTop;
        return offset;
    }

    public cloneMap(original: Map<any, any>): Map<any, any> {
        const clone = new Map<any, any>();
        for (const [key, value] of original) {
            if (value instanceof Map) {
                clone.set(key, this.cloneMap(value));
            } else {
                clone.set(key, value);
            }
        }
        return clone;
    }

    public randomGen(seed: number | string) {
        if (typeof seed == 'string') {
            seed = parseInt(seed, 36);
        }
        const m = 2 ** 35 - 31;
        const a = 185852;
        let s = seed % m;
        return function () {
            return (s = (s * a) % m) / m;
        };
    }
}
export const utils = Utils.instance();
