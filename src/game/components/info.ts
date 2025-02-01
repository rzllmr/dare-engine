import { ComponentSpecs } from 'engine/specs';
import { dialog } from 'game/proxies/dialog';

import { Action } from './action';
import { addComponent } from './registry';


export class Info extends Action {
    private _text: string;

    constructor(specs: ComponentSpecs) {
        super(specs, 'text');

        this._text = this.text;
    }

    public change(text = ''): void {
        this._text = text;
    }

    public show(): void {
        dialog.tell(this._text);
    }

    public get text(): string {
        return this.specs.get('text', '');
    }
}

addComponent('info', Info);
