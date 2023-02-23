import { IComponent } from '../../component';
import { Entity } from '../../entity';
import properties from '../../properties';

export class Inventory implements IComponent {
    public entity: Entity | null = null;
    private readonly items = new Map<string, Item>();

    public addItem(name: string): void {
        const item = Item.create(name);
        this.items.set(name, item);
        item.onAdd();
    }

    public removeItem(name: string): void {
        const item = this.items.get(name);
        if (item === undefined) return;
        item.onRemove();
        this.items.delete(name);
    }
}

// eslint-disable-next-line @typescript-eslint/prefer-function-type
type constr<T> = { new (...args: any[]): T };

abstract class Item {
    public static create(name: string): Item {
        const type = new Map<string, constr<Item>>([
            ['parchment', ParchmentItem],
            ['map', MapItem],
            ['torch', TorchItem]
        ]);

        if (!type.has(name)) throw new Error(`unknown item: ${name}`);

        return new (type.get(name) as constr<Item>)();
    }

    public abstract onAdd(): void;
    public abstract onRemove(): void;
}

class ParchmentItem extends Item {
    public override onAdd(): void {
        properties.set('map-tiles', true);
    }

    public override onRemove(): void {
        properties.set('map-tiles', false);
    }
}

class MapItem extends Item {
    public override onAdd(): void {
        properties.set('reveal-tiles', true);
    }

    public override onRemove(): void {
        properties.set('reveal-tiles', false);
    }
}

class TorchItem extends Item {
    public override onAdd(): void {
        properties.set('vision-distance', 6);
    }

    public override onRemove(): void {
        properties.reset('vision-distance');
    }
}
