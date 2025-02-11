import { ComponentSpecs } from 'engine/specs';
import { Tile } from 'game/entities/tile';
import { log } from 'game/proxies/log';
import { Inventory } from './inventory';
import { Move } from './move';
import { addComponent } from './registry';
import { Action } from './types';

export class Open extends Action {
    private requiredItems: string[] = [];
    private closed!: boolean;

    public override init(): void {
        this.closed = this.load('closed', true);
        if (this.closed && this.need.length > 0) this.requiredItems = this.need;
    }

    public override async act(subject: Tile): Promise<void> {
        if (this.closed && this.requiredItems.length > 0) {
            if (!subject.hasComponent(Inventory)) return;
            const inventory = subject.getComponent(Inventory);
            if (this.requiredItems.every((item) => { return inventory.hasItem(item) })) {
                log.tell(`You unlocked the ${this.object.name} with the ${this.requiredItems.join(', ')}.`);
                this.requiredItems.length = 0;
            } else {
                log.tell(`The ${this.object.name} seems locked and needs a ${this.requiredItems.join(', ')}.`);
                return;
            }
        }
        
        const openSprite = this.object.image.replace(/c$/, 'o');
        this.object.graphic.changeSprite(openSprite);

        if (this.pass) this.object.getComponent(Move).pass = true;

        this.closed = false;
        this.save('closed', this.closed);
    }

    public override async leave(subject: Tile): Promise<void> {
        if (this.object.image.endsWith('o')) {
            const openSprite = this.object.image.replace(/o$/, 'c');
            this.object.graphic.changeSprite(openSprite);
        }
    }

    public get pass(): boolean {
        return this.specs.get('pass', false);
    }

    public get need(): string[] {
        return this.specs.get('need', []);
    }
}

addComponent('open', Open);
