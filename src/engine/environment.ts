import { Point } from "pixi.js";

class Environment {
    private static _instance: Environment;
    public static instance(): Environment {
        if (Environment._instance === undefined) {
            Environment._instance = new Environment();
        }
        return Environment._instance;
    }

    private viewTransform = {
        offset: new Point(),
        scale: 1.0
    };
    
    public register(): void {
        const view = document.querySelector('#view') as HTMLDivElement;
        window.onload = () => {
            window.dispatchEvent(new Event('resize'));
        };
        window.onresize = () => {
            const scale = Math.min( 
                window.innerWidth / view.offsetWidth, 
                window.innerHeight / view.offsetHeight
            );
            const offset = new Point(
                Math.round((window.innerWidth - view.offsetWidth * scale) / 2),
                Math.round((window.innerHeight - view.offsetHeight * scale) / 2)
            );
            view.style.transform = `translate(${offset.x}px, ${offset.y}px) scale(${scale})`;
            this.viewTransform = {offset: offset, scale: scale};
        };
    }

    public get mobile(): boolean {
        const mobileAgents = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];
        
        return mobileAgents.some((mobileAgent) => {
            return navigator.userAgent.match(mobileAgent);
        });
    }

    public get portrait(): boolean {
        return window.innerHeight > window.innerWidth;
    }

    public screenToView(x: number, y: number): Point {
        return new Point(
            Math.round((x - this.viewTransform.offset.x) / this.viewTransform.scale),
            Math.round((y - this.viewTransform.offset.y) / this.viewTransform.scale)
        )
    }

}
export const env = Environment.instance();
