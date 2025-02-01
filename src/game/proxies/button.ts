import { env } from "../../engine/environment";

export class ButtonProxy {
    private readonly buttonNode: HTMLButtonElement;

    constructor(selector: string, max = Infinity) {
        this.buttonNode = document.querySelector(selector) as HTMLButtonElement;
    }

    public register(press: () => void): void {
        const eventType = env.mobile ? 'touchend' : 'click';
        this.buttonNode.addEventListener(eventType, press);
    }

    public disable(disable = true): void {
        this.buttonNode.disabled = disable;
    }
}

export const bookButton = new ButtonProxy('#book-button');
