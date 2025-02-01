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
}
export const utils = Utils.instance();
