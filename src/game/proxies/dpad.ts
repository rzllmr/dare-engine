import { Point } from 'pixi.js';
import { env } from 'engine/environment';
import { input } from 'engine/input';

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

    private moveLoop?: NodeJS.Timeout;
    private lastDirection = 'Middle';

    constructor() {
        this.dPad = document.querySelector('#dpad') as HTMLDivElement;
        this.dPadMiddle = new Point(
            this.dPad.offsetLeft + 3 + this.dPad.offsetWidth / 2,
            this.dPad.offsetTop + 3 + this.dPad.offsetHeight / 2
        );
        this.deadZone = 25;
        this.stepInterval = 300;

        this.registerInput();
    }

    private registerInput(): void {
        input.onDrag(this.dPad, (_, position: Point) => { this.moveDPad(position) });
        input.onRelease(this.dPad, () => { this.dropDPad() });
    }

    public block(block = true):void {
        if (block) {
            this.dropDPad();
            this.blocked = true;
            this.dPad.className = `dpad-inactive`;
        } else {
            this.blocked = false;
            this.dPad.className = `dpad-middle`;
        }
    }

    private moveDPad(position: Point): void {
        if (this.blocked) return;
        
        const move = (direction: string): void => {
            input.sendKey('Arrow' + direction);
        }
        
        const offset = position.subtract(this.dPadMiddle);
        let direction = '';

        if (Math.abs(offset.x) < this.deadZone && Math.abs(offset.y) < this.deadZone
        || Math.abs(offset.x) < this.deadZone && ['Right', 'Left'].includes(this.lastDirection)
        || Math.abs(offset.y) < this.deadZone && ['Up', 'Down'].includes(this.lastDirection)) {
            direction = 'Middle';
        } else if (Math.abs(offset.x) > Math.abs(offset.y)) {
            direction = offset.x > 0 ? 'Right' : 'Left';
        } else {
            direction = offset.y > 0 ? 'Down' : 'Up';
        }
        
        if (direction === this.lastDirection || this.lastDirection !== 'Middle' && direction !== 'Middle') return;
        this.lastDirection = direction;
        
        this.dPad.className = `dpad-${direction.toLowerCase()}`;
        clearInterval(this.moveLoop);
        if (direction !== 'Middle') {
            move(direction);
            this.moveLoop = setInterval(() => {
                move(direction);
            }, this.stepInterval);
        }
    };

    private dropDPad(): void {
        if (this.blocked) return;
        const direction = 'Middle';
        this.lastDirection = direction;
        this.dPad.className = `dpad-${direction.toLowerCase()}`;
        clearInterval(this.moveLoop);
    };
}
export const dpad = Dpad.instance();
