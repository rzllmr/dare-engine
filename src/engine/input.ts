import { Point } from 'pixi.js';
import { book } from 'game/proxies/book';
import { bookButton } from 'game/proxies/button';
import { dialog } from 'game/proxies/dialog';
import { dpad } from 'game/proxies/dpad';
import { env } from './environment';
import { IScene } from './manager';

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
        }
        this.registerKeyboard();
    }

    public attach(scene: IScene): void {
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
        const keybindings: Record<string, Keybinding> = {
            'book': {
                'check': () => { return book.visible; },
                'ArrowLeft': () => { book.changeTab('Left'); },
                'ArrowRight': () => { book.changeTab('Right'); },
                'b': () => {
                    book.show(false);
                    dpad.block(false);
                }
            },
            'dialog': {
                'check': () => { return dialog.showing; },
                ' ': () => { dialog.continue(); },
            },
            'default': {
                'check': () => { return true; },
                'b': () => {
                    book.show(true);
                    dpad.block(true);
                },
                'default': (key) => { this.scene?.input(this.mousePos, key); }
            }
        };
        const pressedKeys = new Map<string, NodeJS.Timeout>();

        document.body.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.repeat) return;

            let binding: ((key: string) => void) | undefined;
            for (const mode of Object.values(keybindings)) {
                if (mode.check()) {
                    binding = mode[event.key];
                    if (binding === undefined) binding = mode['default'];
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

    private registerTouch(): void {
        const pixiContent = document.querySelector('#pixi-content') as HTMLDivElement;
        pixiContent.addEventListener('touchstart', (event: TouchEvent) => {
            const firstTouch = event.touches[0];
            this.touchPos = env.screenToView(firstTouch.pageX, firstTouch.pageY);
            this.scene?.input(this.touchPos);
        });

        dpad.register((direction: string) => {
            this.scene?.input(new Point(), `Arrow${direction}`);
        });

        bookButton.register(() => {
            book.show(!book.visible);
            dpad.block(book.visible);
        });

        this.swipeOn(book.element, (key: string) => {
            const direction = key.replace('Swipe', '');
            book.changeTab(direction);
        });
    }

    private swipeOn(element: HTMLElement, swipe: (key: string) => void): void {
        let touchPos = new Point();
        element.addEventListener('touchstart', (event: TouchEvent) => {
            const firstTouch = event.touches[0];
            touchPos = env.screenToView(firstTouch.pageX, firstTouch.pageY);
            this.scene?.input(this.touchPos);
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
