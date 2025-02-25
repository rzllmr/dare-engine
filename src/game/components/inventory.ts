import { properties } from 'engine/properties';
import { ComponentSpecs, EntitySpecs } from 'engine/specs';
import { ListProxy } from 'game/proxies/list';
import { PropertyNames } from 'game/entities/map';
import { addComponent } from './registry';
import { SpecdComponent } from './types';

interface BodyPart {
    max: number;
    items: string[];
}

export class Inventory extends SpecdComponent {
    private readonly items: Map<string, Item>;
    private readonly equippedList: ListProxy;
    private readonly packedList: ListProxy;
    private readonly equippedParts: Map<string, BodyPart>;

    constructor(specs: ComponentSpecs) {
        super(specs);
        
        this.items = new Map<string, Item>();
        this.equippedList = new ListProxy('#equipped');
        this.packedList = new ListProxy('#packed');
        this.equippedParts = new Map([
            ['hand', { max: 2, items: [] }],
            ['head', { max: 1, items: [] }],
            ['body', { max: 2, items: [] }],
            ['feet', { max: 1, items: [] }],
            ['back', { max: 2, items: [] }]
        ]);
    }

    public override init(): void {
        const savedItems = this.load('items', [] as string[]);
        for (const name of savedItems) {
            const item = Item.create(name);
            this.addItem(item);
        }
    }

    public addItem(item: Item): boolean {
        this.items.set(item.name, item);
        this.save('items', Array.from(this.items.keys()));

        if (item.isEquipment() && this.canEquip(item)) {
            item.onEquip();
            this.equippedList.add(`${item.name} (${item.where})`);
        } else {
            item.onTake();
            this.packedList.add(item.name);
        }

        return true;
    }

    public removeItem(name: string): boolean {
        const item = this.items.get(name);
        if (item === undefined) return true;

        item.onDrop();
        this.items.delete(name);
        this.save('items', Array.from(this.items.keys()));
        return true;
    }

    public hasItem(name: string): boolean {
        return this.items.has(name);
    }

    private canEquip(item: Item): boolean {
        const part = this.equippedParts.get(item.where);
        if (part !== undefined && part.items.length < part.max) {
            part.items.push(item.name);
            return true;
        }
        return false;
    }
}

export class Item {
    public readonly name: string;
    public readonly info: string;
    private readonly specs: any;

    public static create(name: string): Item {
        const itemSpecs = EntitySpecs.get(name);
        const infoText = itemSpecs.component('info')?.get('brief', '') || '';
        const pickSpecs = itemSpecs.component('pick');
        return new Item(name, infoText, pickSpecs);
    }

    constructor(name: string, info: string, specs: any) {
        this.name = name;
        this.info = info;
        this.specs = specs;
    }

    public isEquipment(): boolean {
        return this.specs?.has('equip');
    }

    public get where(): string {
        return this.specs?.get('where');
    }

    public onTake(): void {
        this.onAdd('take');
    }

    public onDrop(): void {
        this.onRemove('take');
    }

    public onEquip(): void {
        this.onAdd('equip');
    }

    public onUnequip(): void {
        this.onRemove('equip');
    }

    private onAdd(action: string): void {
        const changes = this.specs?.get(action) as string[][];
        if (changes !== undefined) {
            changes.forEach((change) => {
                properties.set(change[0] as PropertyNames, change[1]);
            });
        }
    }

    private onRemove(action: string): void {
        const changes = this.specs.get(action) as string[][];
        if (changes !== undefined) {
            changes.forEach((change) => {
                properties.reset(change[0] as PropertyNames);
            });
        }
    }
}

addComponent('inventory', Inventory);
