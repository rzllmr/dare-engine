import env from '../../engine/environment';
import { Point } from 'pixi.js';

class Dpad {
    private static _instance: Dpad;
    public static instance(): Dpad {
        if (Dpad._instance === undefined) {
            Dpad._instance = new Dpad();
        }
        return Dpad._instance;
    }
    
    private blocked = false;
    private readonly dPad: HTMLDivElement;
    private readonly dPadMiddle: Point;
    private readonly deadZone: number;
    private readonly stepInterval: number;

    constructor() {
        this.dPad = document.querySelector('#dpad') as HTMLDivElement;
        this.dPadMiddle = new Point(
            this.dPad.offsetLeft + 3 + this.dPad.offsetWidth / 2,
            this.dPad.offsetTop + 3 + this.dPad.offsetHeight / 2
        );
        this.deadZone = 25;
        this.stepInterval = 300;
    }

    public block(block = true):void {
        if (block) {
            this.dPad.dispatchEvent(new Event('touchend'));
            this.blocked = true;
            this.dPad.className = `dpad-inactive`;
        } else {
            this.blocked = false;
            this.dPad.className = `dpad-middle`;
        }
    }

    public register(move: (direction: string) => void): void {
        let moveLoop : NodeJS.Timer;
        let lastDirection = 'Middle';
        
        const moveDPad = (event: TouchEvent): void => {
            const firstTouch = event.touches[0];
            if (firstTouch === undefined) return;
            if (this.blocked) return;
            
            const touchPos = env.screenToView(firstTouch.pageX, firstTouch.pageY);
            const offset = new Point(
                touchPos.x - this.dPadMiddle.x,
                touchPos.y - this.dPadMiddle.y
            );
            
            let direction = '';
            if (Math.abs(offset.x) < this.deadZone && Math.abs(offset.y) < this.deadZone
            || Math.abs(offset.x) < this.deadZone && ['Right', 'Left'].includes(lastDirection)
            || Math.abs(offset.y) < this.deadZone && ['Up', 'Down'].includes(lastDirection)) {
                direction = 'Middle';
            } else if (Math.abs(offset.x) > Math.abs(offset.y)) {
                direction = offset.x > 0 ? 'Right' : 'Left';
            } else {
                direction = offset.y > 0 ? 'Down' : 'Up';
            }
            
            if (direction === lastDirection || lastDirection !== 'Middle' && direction !== 'Middle') return;
            lastDirection = direction;
            
            this.dPad.className = `dpad-${direction.toLowerCase()}`;
            clearInterval(moveLoop);
            if (direction !== 'Middle') {
                move(direction);
                moveLoop = setInterval(() => {
                    move(direction);
                }, this.stepInterval);
            }
        };

        const dropDPad = (event: TouchEvent): void => {
            if (this.blocked) return;
            const direction = 'Middle';
            lastDirection = direction;
            this.dPad.className = `dpad-${direction.toLowerCase()}`;
            clearInterval(moveLoop);
        };
        
        this.dPad.addEventListener('touchstart', moveDPad);
        this.dPad.addEventListener('touchmove', moveDPad);
        this.dPad.addEventListener('touchend', dropDPad);
    }    
}
const dpad = Dpad.instance();
export default dpad;