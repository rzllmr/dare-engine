import { ComponentSpecs } from 'engine/specs';
import { Tile } from 'game/entities/tile';
import { log } from 'game/proxies/log';
import { addComponent } from './registry';
import { Action } from './types';

export class Tell extends Action {
    constructor(specs: ComponentSpecs) {
        super(specs, 'text');
    }

    public override async act(subject: Tile): Promise<void> {
        if (subject.name !== 'player') return;

        log.tell(this.text);
    }

    public get text(): string {
        return this.specs.get('text', '');
    }
}

addComponent('tell', Tell);
