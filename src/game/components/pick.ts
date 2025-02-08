import { EntitySpecs, ComponentSpecs } from 'engine/specs';
import { Tile } from 'game/entities/tile';
import { log } from 'game/proxies/log';
import { Inventory, Item } from './inventory';
import { addComponent } from './registry';
import { Action } from './types';

export class Pick extends Action {
    private readonly items: Item[] = [];
    private readonly destroyObject: boolean = true;

    constructor(specs: ComponentSpecs) {
        super(specs);

        for (const itemName of this.item) {
            const itemSpecs = EntitySpecs.get(itemName);

            const infoText = itemSpecs.component('info')?.get('brief', '') || '';
            const pickSpecs = itemSpecs.component('pick');
            this.items.push(new Item(itemName, infoText, pickSpecs));
            this.destroyObject = false;
        }
    }

    public override init(): void {
        if (this.items.length == 0) {
            this.items.push(new Item(this.object.name, this.object.info, this.specs));
        }
    }

    public override async act(subject: Tile): Promise<void> {
        if (this.items.length == 0) return;
        if (!subject.hasComponent(Inventory)) return;

        const inventory = subject.getComponent(Inventory);

        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            log.tell(`You found ${this.decapitalize(item.info)}`);
            const couldBeAdded = inventory.addItem(item);
            if (couldBeAdded) this.items.splice(i, 1);
        }
        if (this.items.length == 0 && this.destroyObject) this.object.markForDestruction();
    }

    public get item(): string[] {
        return this.specs.get('item', []);
    }

    public get take(): string[] {
        return this.specs.get('take', []);
    }

    public get equip(): string[] {
        return this.specs.get('equip', []);
    }

    public get part(): string {
        return this.specs.get('part', '');
    }
}

addComponent('pick', Pick);
