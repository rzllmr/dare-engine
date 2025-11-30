import { Point } from 'pixi.js';
import { env } from './environment';

export type KeyMode = 'dialog' | 'book' | 'map';
const keyModes: KeyMode[] = ['dialog', 'book', 'map'];

interface Keybinding {
    check: () => boolean;
    [key: string]: (key: string) => void;
}

class Input {
    private static _instance: Input;
    public static instance(): Input {
        if (Input._instance === undefined) {
            Input._instance = new Input();
        }
        return Input._instance;
    }

    private constructor() {
        this.registerKeyboard();
    }

    private keybindings: Record<string, Keybinding> = {};
    public onKeys(mode: KeyMode, keybindings: Keybinding): void {
        this.keybindings[mode] = keybindings;
    }

    private registerKeyboard(): void {
        const pressedKeys = new Map<string, NodeJS.Timeout>();

        document.body.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.repeat) return;

            let binding: ((key: string) => void) | undefined;
            for (const mode of keyModes) {
                const bindings = this.keybindings[mode];
                if (bindings === undefined) continue;
                if (bindings.check()) {
                    binding = bindings[event.key];
                    if (binding === undefined) binding = bindings['default'];
                    break;
                }
            }
            if (binding === undefined) return;

            binding(event.key);
            pressedKeys.set(event.key, setInterval(() => {
                binding(event.key);
            }, 300));
        });
        
        document.body.addEventListener('keyup', (event: KeyboardEvent) => {
            const interval = pressedKeys.get(event.key);
            if (interval !== undefined) clearInterval(interval);
            pressedKeys.delete(event.key);
        });
    }

    public sendKey(key: string): void {
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: key }));
        document.body.dispatchEvent(new KeyboardEvent('keyup', { key: key }));
    }

    public onMouse(element: HTMLElement, callback: (button: string, position: Point) => void, kind: 'mousedown' | 'mousemove' | 'mouseup'): void {
        element.addEventListener(kind, (event: MouseEvent) => {
            const position = env.screenToView(event.pageX, event.pageY);
            const mouseButton = ['LeftClick', 'MiddleClick', 'RightClick'];
            callback(mouseButton[event.button], position);
        });
    }
    
    public onTouch(element: HTMLElement, callback: (button: string, position: Point) => void, kind: 'touchstart' | 'touchmove' | 'touchend'): void {
        element.addEventListener(kind, (event: TouchEvent) => {
            const firstTouch = event.changedTouches[0];
            const position = env.screenToView(firstTouch.pageX, firstTouch.pageY);
            callback('LeftClick', position);
        });
    }

    public onHit(element: HTMLElement, callback: (button: string, position: Point) => void): void {
        if (env.mobile) {
            this.onTouch(element, callback, 'touchstart');
        } else {
            this.onMouse(element, callback, 'mousedown');
        }
    }

    public onRelease(element: HTMLElement, callback: (button: string, position: Point) => void): void {
        if (env.mobile) {
            this.onTouch(element, callback, 'touchend');
        } else {
            this.onMouse(element, callback, 'mouseup');
        }
    }

    public onDrag(element: HTMLElement, callback: (button: string, position: Point) => void): void {
        if (env.mobile) {
            this.onTouch(element, callback, 'touchstart');
            this.onTouch(element, callback, 'touchmove');
        } else {
            this.onMouse(element, callback, 'mousedown');
            this.onMouse(element, (button:string, position: Point) => {
                if (button !== undefined) callback(button, position);
            }, 'mousemove');
        }
    }

    public onSwipe(element: HTMLElement, swipe: (button: string) => void): void {
        let touchPos = new Point();
        element.addEventListener('touchstart', (event: TouchEvent) => {
            const firstTouch = event.changedTouches[0];
            touchPos = env.screenToView(firstTouch.pageX, firstTouch.pageY);
        })
        element.addEventListener('touchend', (event: TouchEvent) => {
            const firstTouch = event.changedTouches[0];
            if (firstTouch === undefined) return;

            const endPos = env.screenToView(firstTouch.pageX, firstTouch.pageY);
            const diff = endPos.subtract(touchPos);
            if (Math.abs(diff.x) < 100 && Math.abs(diff.y) < 100) return;
            
            let direction = '';
            if ( Math.abs( diff.x ) > Math.abs( diff.y ) ) {
                direction = diff.x > 0 ? 'RightSwipe' : 'LeftSwipe';
            } else {
                direction = diff.y > 0 ? 'DownSwipe' : 'UpSwipe';
            }

            touchPos = new Point();
            swipe(direction);
        });
    }
}
export const input = Input.instance();
