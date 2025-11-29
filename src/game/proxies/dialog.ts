import { Story } from 'inkjs';
import { Assets, Point } from 'pixi.js';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Animation } from 'engine/animation';
import { input } from 'engine/input';
import { storage } from 'engine/storage';
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
    private animation?: Animation;

    private constructor() {
        this.dialogNode = document.querySelector('#dialog') as HTMLDivElement;
        this.dialogText = document.querySelector('#dialog-text') as HTMLDivElement;

        this.story = null;
        this.lines = [];

        this.registerInput();
    }

    private registerInput(): void {
        input.onHit(this.dialogNode, this.continue.bind(this));
        input.onKeys('dialog', {
            'check': () => { return this.showing; },
            ' ': () => { this.continue(); },
        });
    }

    public continue(): void {
        if (this.animation?.running() === true) {
            this.animation?.skip();
            this.animation = undefined;
        } else if (this.story?.canContinue === true) {
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
        const storageEntry = `dialog/told/${story}.${knot}`;
        if (storage.load(storageEntry, false)) return;
        else storage.save(storageEntry, true);

        this.story = Assets.get<Story>(`dialog.${story}`);
        this.story.ChoosePathString(knot);
        this.continue();
    }

    private tellLine(line?: string): void {
        if (line === undefined) return;
        this.dialogText.innerHTML = '';
        this.typewriter(line);
        this.show();
    }

    private typewriter(line: string): void {
        const letterPause = 50; // milliseconds per letter
        line = this.wordWrapToLineBreaks(line, this.dialogText).replaceAll('<br>', '|');
        const tween = new Tween({idx: 0}).to({idx: line.length})
            .easing(Animation.stepEasing(line.length))
            .duration(letterPause * line.length);
        tween.onUpdate((current) => {
            this.dialogText.innerHTML = line.substring(0, current.idx).replaceAll('|', '<br>');
        });
        this.animation = new Animation(tween);
        this.animation.run();
    }

    private show(show = true): void {
        dpad.block(show);
        bookButton.disable(show);
        this.dialogNode.style.visibility = show ? 'visible' : 'hidden';
    }

    public get showing(): boolean {
        return this.dialogNode.style.visibility == 'visible';
    }

    public text(): string | null {
        return this.dialogText.textContent;
    }

    private wordWrapToLineBreaks(text: string, box: HTMLDivElement): string {
        const testNode = document.createElement('div');
        testNode.style.visibility = 'hidden';
        testNode.style.position = 'absolute';
        testNode.style.top = '0';
        testNode.style.font = window.getComputedStyle(box).font;

        const viewNode = document.getElementById('view');
        viewNode?.appendChild(testNode);

        let processedText = '';
        let currentLine = '';
        for (const word of text.split(' ')) {
            const testLine = currentLine + (currentLine === '' ? '' : ' ') + word;
            testNode.innerHTML = testLine;
            if (testNode.clientWidth > box.clientWidth) {
                if (processedText !== '') processedText += '<br>';
                processedText += currentLine;
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine !== '') {
            if (processedText !== '') processedText += '<br>';
            processedText += currentLine;
        }
        viewNode?.removeChild(testNode);

        return processedText;
    }
}
export const dialog = DialogProxy.instance();
