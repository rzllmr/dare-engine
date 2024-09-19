import { Assets, Point } from 'pixi.js';
import { Story } from 'inkjs';
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
    private story: Story | null;

    private constructor() {
        this.dialogNode = document.querySelector('#dialog') as HTMLDivElement;
        this.dialogText = document.querySelector('#dialog-text') as HTMLDivElement;

        this.dialogNode.addEventListener('touchstart', this.continue.bind(this));
        this.story = null;
    }

    private continue(): void {
        if (this.story?.canContinue === true) {
            const line = this.story.Continue() ?? '';
            this.tell(line);
        } else {
            this.show(false);
        }
    }

    public tell(line: string, position = new Point()): void {
        if (line === '') return;

        this.dialogText.innerHTML = line;
        this.show();
    }

    public tellStory(story: string, knot: string): void {
        this.story = Assets.get<Story>(`dialog.${story}`);
        this.story.ChoosePathString(knot);
        this.continue();
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
