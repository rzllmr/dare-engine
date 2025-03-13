import { ComponentSpecs } from 'engine/specs';
import { Tile } from 'game/entities/tile';
import { dialog } from 'game/proxies/dialog';
import { addComponent } from './registry';
import { Action } from './types';

export class Tell extends Action {
    constructor(specs: ComponentSpecs) {
        super(specs, 'line');
    }

    public override async act(subject: Tile): Promise<void> {
        if (subject.name !== 'player') return;

        if (this.story != undefined) {
            const story = this.story.split('.');
            dialog.tellStory(story[0], story[1]);
        } else {
            dialog.tell(this.line);
        }
    }

    public get line(): string {
        return this.specs.get('line', '');
    }

    public get story(): string | undefined {
        return this.specs.get('story');
    }

    public get once(): boolean {
        return this.specs.get('once', false);
    }
}

addComponent('tell', Tell);
