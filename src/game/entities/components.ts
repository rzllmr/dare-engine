import { IComponent } from '../../component';
import { Entity } from '../../entity';
import properties from '../../properties';

export class Inventory implements IComponent {
    public Entity: Entity | null = null;
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

abstract class Item {
    public static create(name: string): Item {
        switch (name) {
            case 'map':
                return new MapItem();
            default:
                throw new Error(`unknown item: ${name}`);
        }
    }

    public abstract onAdd(): void;
    public abstract onRemove(): void;
}

class MapItem extends Item {
    public override onAdd(): void {
        properties.set('map-tiles', true);
    }

    public override onRemove(): void {
        properties.set('map-tiles', false);
    }
}
