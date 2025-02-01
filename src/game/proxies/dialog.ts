import { Assets, Point } from 'pixi.js';
import { Story } from 'inkjs';

import { bookButton } from './button';
import { dpad } from './dpad';

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
    private readonly lines: string[];

    private constructor() {
        this.dialogNode = document.querySelector('#dialog') as HTMLDivElement;
        this.dialogText = document.querySelector('#dialog-text') as HTMLDivElement;

        this.dialogNode.addEventListener('touchstart', this.continue.bind(this));
        this.story = null;
        this.lines = [];
    }

    private continue(): void {
        if (this.story?.canContinue === true) {
            const line = this.story.Continue() ?? '';
            this.tellLine(line);
        } else if (this.lines.length > 0) {
            this.tellLine(this.lines.shift());
        } else {
            this.show(false);
        }
    }

    public tell(line: string, position = new Point()): void {
        if (line === '') return;

        this.lines.push(line);
        if (!this.showing) this.continue();
    }

    public tellStory(story: string, knot: string): void {
        this.story = Assets.get<Story>(`dialog.${story}`);
        this.story.ChoosePathString(knot);
        this.continue();
    }

    private tellLine(line?: string): void {
        if (line === undefined) return;
        this.dialogText.innerHTML = line;
        this.show();
    }

    private show(show = true): void {
        dpad.block(show);
        bookButton.disable(show);
        this.dialogNode.style.visibility = show ? 'visible' : 'hidden';
    }

    private get showing(): boolean {
        return this.dialogNode.style.visibility == 'visible';
    }

    public text(): string | null {
        return this.dialogText.textContent;
    }
}
export const dialog = DialogProxy.instance();
