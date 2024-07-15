import { Application, DisplayObject, Point, Rectangle } from 'pixi.js';

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
    private mousePos = new Point(0, 0);
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
        this.registerInput();

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
        };
    }

    private registerInput(): void {
        const pixiDiv = document.querySelector('#pixi-content') as HTMLDivElement;
        
        document.body.addEventListener('keydown', (event: KeyboardEvent) => {
            this.currentScene?.input(this.mousePos, event.key);
        });
        
        pixiDiv.addEventListener('mousemove', (event: MouseEvent) => {
            this.mousePos = new Point(
                Math.round(event.pageX / this.scale),
                Math.round(event.pageY / this.scale)
            );
            this.currentScene?.input(this.mousePos);
        });

        const mouseButton = ['LeftClick', 'MiddleClick', 'RightClick'];
        pixiDiv.addEventListener('mousedown', (event: MouseEvent) => {
            this.currentScene?.input(this.mousePos, mouseButton[event.button]);
        });
        pixiDiv.addEventListener('touchstart', (event: TouchEvent) => {
            const firstTouch = event.touches[0];
            this.mousePos = new Point(
                Math.round(firstTouch.pageX / this.scale),
                Math.round(firstTouch.pageY / this.scale)
            );
            this.currentScene?.input(this.mousePos);
        });

        const tome = document.querySelector('#tome') as HTMLDivElement;
        tome.addEventListener('touchstart', (event: TouchEvent) => {
            const firstTouch = event.touches[0];
            this.mousePos = new Point(
                Math.round(firstTouch.pageX / this.scale),
                Math.round(firstTouch.pageY / this.scale)
            );
            this.currentScene?.input(this.mousePos);
        })
        tome.addEventListener('touchend', (event: TouchEvent) => {
            const firstTouch = event.changedTouches[0];
            if (firstTouch === undefined) return;

            const endPos = new Point(
                Math.round(firstTouch.pageX / this.scale),
                Math.round(firstTouch.pageY / this.scale)
            );
            const diff = new Point(
                endPos.x - this.mousePos.x,
                endPos.y - this.mousePos.y
            );
            if (Math.abs(diff.x) < 100 && Math.abs(diff.y) < 100) return;
            
            let swipeDirection = '';
            if ( Math.abs( diff.x ) > Math.abs( diff.y ) ) {
                swipeDirection = diff.x > 0 ? 'RightSwipe' : 'LeftSwipe';
            } else {
                swipeDirection = diff.y > 0 ? 'DownSwipe' : 'UpSwipe';
            }

            this.mousePos = new Point();
            this.currentScene?.input(this.mousePos, swipeDirection);
        });

        const dpad = document.querySelector('#dpad') as HTMLDivElement;
        const dpadMiddle = new Point(
            dpad.offsetLeft + dpad.offsetWidth / 2,
            dpad.offsetTop + dpad.offsetHeight / 2
        );

        let lastDirection = 'Middle';
        let moveLoop : NodeJS.Timer;
        const moveDpad = (event: TouchEvent): void => {
            const firstTouch = event.touches[0];
            if (firstTouch === undefined) return;

            const touchPos = this.scaledPoint(firstTouch.pageX, firstTouch.pageY);
            const offset = new Point(
                touchPos.x - dpadMiddle.x,
                touchPos.y - dpadMiddle.y
            );

            const deadZone = 3 * 10;
            let direction = '';
            if (Math.abs(offset.x) < deadZone && Math.abs(offset.y) < deadZone) {
                direction = 'Middle';
            } else if (Math.abs(offset.x) > Math.abs(offset.y)) {
                direction = offset.x > 0 ? 'Right' : 'Left';
            } else {
                direction = offset.y > 0 ? 'Down' : 'Up';
            }

            if (direction === lastDirection || lastDirection !== 'Middle' && direction !== 'Middle') return;
            lastDirection = direction;

            dpad.className = `dpad-${direction.toLowerCase()}`;
            clearInterval(moveLoop);
            if (direction !== 'Middle') {
                this.currentScene?.input(new Point(), `Arrow${direction}`);
                moveLoop = setInterval(() => {
                    this.currentScene?.input(new Point(), `Arrow${direction}`);
                }, 300);
            }
        };

        dpad.addEventListener('touchstart', moveDpad);
        dpad.addEventListener('touchmove', moveDpad);
        dpad.addEventListener('touchend', (event: TouchEvent) => {
            const direction = 'Middle';
            lastDirection = direction;
            dpad.className = `dpad-${direction.toLowerCase()}`;
            clearInterval(moveLoop);
        });

        const button = document.querySelector('#button') as HTMLDivElement;
        button.addEventListener('touchstart', (event: TouchEvent) => {
            const tomeHidden = tome.style.visibility === 'hidden';
            tome.style.visibility = tomeHidden ? 'visible' : 'hidden';
            dpad.className = tomeHidden ? 'dpad-inactive' : 'dpad-middle';
        });
    }

    private scaledPoint(x: number, y: number): Point {
        return new Point(
            Math.round(x / this.scale),
            Math.round(y / this.scale)
        )
    }

    private detectMobile(): boolean {
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

    private elementOffset(element: HTMLElement): {left: number, top: number} {
        const rect: DOMRect = element.getBoundingClientRect();
        return {
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY
        };
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
