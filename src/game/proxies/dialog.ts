import { Point } from 'pixi.js';
import dpad from './dpad';
import { bookButton } from './button';

class DialogProxy {
    private static _instance: DialogProxy;
    public static instance(): DialogProxy {
        if (DialogProxy._instance === undefined) {
            DialogProxy._instance = new DialogProxy();
        }
        return DialogProxy._instance;
    }

    private readonly dialogNode: HTMLDivElement;
    private readonly dialogText: HTMLDivElement;

    private constructor() {
        this.dialogNode = document.querySelector('#dialog') as HTMLDivElement;
        this.dialogText = document.querySelector('#dialog-text') as HTMLDivElement;

        this.dialogNode.addEventListener('touchstart', () => {
            this.show(false);
        });
    }

    public tell(line: string, position = new Point()): void {
        if (line === '') return;

        this.dialogText.innerHTML = line;
        this.show();
    }

    public show(show = true): void {
        dpad.block(show);
        bookButton.disable(show);
        this.dialogNode.style.visibility = show ? 'visible' : 'hidden';
    }

    public text(): string | null {
        return this.dialogText.textContent;
    }
}
const dialog = DialogProxy.instance();
export default dialog;
