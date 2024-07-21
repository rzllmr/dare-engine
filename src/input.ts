import env from './environment';
import { Point } from 'pixi.js';
import { IScene } from './manager';

class Input {
    private static _instance: Input;
    public static instance(): Input {
        if (Input._instance === undefined) {
            Input._instance = new Input();
        }
        return Input._instance;
    }

    private scene: IScene | null = null;
    private mousePos = new Point(0, 0);
    private touchPos = new Point(0, 0);

    private constructor() {
    }

    public register(): void {
        if (env.mobile) {
            this.registerTouch();
        } else {
            this.registerMouse();
            this.registerKeyboard();
        }
    }

    public changeScene(scene: IScene): void {
        this.scene = scene;
    }

    private registerMouse(): void {
        const pixiContent = document.querySelector('#pixi-content') as HTMLDivElement;
        
        pixiContent.addEventListener('mousemove', (event: MouseEvent) => {
            this.mousePos = env.screenToView(event.pageX, event.pageY);
            this.scene?.input(this.mousePos);
        });

        const mouseButton = ['LeftClick', 'MiddleClick', 'RightClick'];
        pixiContent.addEventListener('mousedown', (event: MouseEvent) => {
            this.scene?.input(this.mousePos, mouseButton[event.button]);
        });
    }

    private registerKeyboard(): void {
        document.body.addEventListener('keydown', (event: KeyboardEvent) => {
            this.scene?.input(this.mousePos, event.key);
        });
    }

    private registerTouch(): void {
        const pixiContent = document.querySelector('#pixi-content') as HTMLDivElement;
        pixiContent.addEventListener('touchstart', (event: TouchEvent) => {
            const firstTouch = event.touches[0];
            this.touchPos = env.screenToView(firstTouch.pageX, firstTouch.pageY);
            this.scene?.input(this.touchPos);
        });

        // virtual d-pad
        const dPad = document.querySelector('#dpad') as HTMLDivElement;
        const dPadMiddle = new Point(
            dPad.offsetLeft + 3 + dPad.offsetWidth / 2,
            dPad.offsetTop + 3 + dPad.offsetHeight / 2
        );

        let moveLoop : NodeJS.Timer;
        let lastDirection = 'Middle';
        const moveDPad = (event: TouchEvent): void => {
            const firstTouch = event.touches[0];
            if (firstTouch === undefined) return;

            const touchPos = this.screenToView(firstTouch.pageX, firstTouch.pageY);
            const offset = new Point(
                touchPos.x - dPadMiddle.x,
                touchPos.y - dPadMiddle.y
            );

            const deadZone = 25;
            let direction = '';
            if (Math.abs(offset.x) < deadZone && Math.abs(offset.y) < deadZone
                || Math.abs(offset.x) < deadZone && ['Right', 'Left'].includes(lastDirection)
                || Math.abs(offset.y) < deadZone && ['Up', 'Down'].includes(lastDirection)) {
                direction = 'Middle';
            } else if (Math.abs(offset.x) > Math.abs(offset.y)) {
                direction = offset.x > 0 ? 'Right' : 'Left';
            } else {
                direction = offset.y > 0 ? 'Down' : 'Up';
            }

            if (direction === lastDirection || lastDirection !== 'Middle' && direction !== 'Middle') return;
            lastDirection = direction;

            dPad.className = `dpad-${direction.toLowerCase()}`;
            clearInterval(moveLoop);
            if (direction !== 'Middle') {
                this.scene?.input(new Point(), `Arrow${direction}`);
                moveLoop = setInterval(() => {
                    this.scene?.input(new Point(), `Arrow${direction}`);
                }, 300);
            }
        };
        dPad.addEventListener('touchstart', moveDPad);
        dPad.addEventListener('touchmove', moveDPad);
        dPad.addEventListener('touchend', (event: TouchEvent) => {
            const direction = 'Middle';
            lastDirection = direction;
            dPad.className = `dpad-${direction.toLowerCase()}`;
            clearInterval(moveLoop);
        });

        // button to show and hide book
        const book = document.querySelector('#book') as HTMLDivElement;
        const bookButton = document.querySelector('#book-button') as HTMLDivElement;
        bookButton.addEventListener('touchstart', (event: TouchEvent) => {
            const bookHidden = book.style.visibility === 'hidden';
            book.style.visibility = bookHidden ? 'visible' : 'hidden';
            dPad.className = bookHidden ? 'dpad-inactive' : 'dpad-middle';
        });

        // swipe to turn pages
        book.addEventListener('touchstart', (event: TouchEvent) => {
            const firstTouch = event.touches[0];
            this.touchPos = this.screenToView(firstTouch.pageX, firstTouch.pageY);
            this.scene?.input(this.touchPos);
        })
        book.addEventListener('touchend', (event: TouchEvent) => {
            const firstTouch = event.changedTouches[0];
            if (firstTouch === undefined) return;

            const endPos = this.screenToView(firstTouch.pageX, firstTouch.pageY);
            const diff = new Point(
                endPos.x - this.touchPos.x,
                endPos.y - this.touchPos.y
            );
            if (Math.abs(diff.x) < 100 && Math.abs(diff.y) < 100) return;
            
            let swipeDirection = '';
            if ( Math.abs( diff.x ) > Math.abs( diff.y ) ) {
                swipeDirection = diff.x > 0 ? 'RightSwipe' : 'LeftSwipe';
            } else {
                swipeDirection = diff.y > 0 ? 'DownSwipe' : 'UpSwipe';
            }

            this.touchPos = new Point();
            this.scene?.input(this.touchPos, swipeDirection);
        });
    }
}
const input = Input.instance();
export default input;
