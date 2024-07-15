import { Point } from 'pixi.js';

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
            this.tell('');
        });
    }

    public tell(line: string, position = new Point()): void {
        this.dialogText.innerHTML = line;
        if (line === '') this.dialogNode.style.visibility = 'hidden';
        else this.dialogNode.style.visibility = 'visible';
    }

    public text(): string | null {
        return this.dialogText.textContent;
    }
}
const dialog = DialogProxy.instance();
export default dialog;
