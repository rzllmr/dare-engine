import { Tile } from 'game/entities/tile';
import { log } from 'game/proxies/log';
import { Inventory, Item } from './inventory';
import { addComponent } from './registry';
import { Action } from './types';

export class Pick extends Action {
    private readonly items: Item[] = [];
    private destroyObject: boolean = true;

    public override init(): void {
        if (this.container()) {
            const items = this.load('items', this.item);
            for (const itemName of items) {
                this.items.push(Item.create(itemName));
                this.destroyObject = false;
            }
        } else {
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
            if (couldBeAdded) {
                this.items.splice(i, 1);
                this.save('items', this.items.map((item) => {return item.name;}))
            }
        }
        if (this.items.length == 0 && this.destroyObject) this.object.markForDestruction();
    }

    public container(): boolean {
        return this.specs.get('item') != undefined;
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

    public get where(): string {
        return this.specs.get('where', '');
    }
}

addComponent('pick', Pick);
