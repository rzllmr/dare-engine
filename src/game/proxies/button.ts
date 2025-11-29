import { input } from "engine/input";
import { book } from "./book";
import { dpad } from "./dpad";

export class ButtonProxy {
    private readonly buttonNode: HTMLButtonElement;

    constructor(selector: string, effect: () => void) {
        this.buttonNode = document.querySelector(selector) as HTMLButtonElement;
        this.registerInput(effect);
    }

    private registerInput(effect: () => void): void {
        input.onRelease(this.buttonNode, effect);
    }

    public disable(disable = true): void {
        this.buttonNode.disabled = disable;
    }
}

export const bookButton = new ButtonProxy('#book-button', () => {
    book.show(!book.visible);
    dpad.block(book.visible);
});
