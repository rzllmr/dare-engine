import { Tile } from '../entities/tile';
import { Point } from 'pixi.js';
import { IComponent } from '../../component';
import { Inventory } from './inventory';
import { Graphic } from './graphic';
import log from '../../log';
import { Entity } from '../../entity';

export abstract class Action implements IComponent {
    public entity: Entity | null = null;
    public get object(): Tile {
        return this.entity as Tile;
    }

    public abstract act(subject: Tile): void;
}

export class Move extends Action {
    public override act(subject: Tile): void {
        subject.getComponent(Graphic).position = this.object.getComponent(Graphic).position;
    }

    public static direction(direction: string): Point {
        switch (direction.toLowerCase()) {
            case 'up':
                return new Point(0, -1);
            case 'down':
                return new Point(0, 1);
            case 'left':
                return new Point(-1, 0);
            case 'right':
                return new Point(1, 0);
            default:
                throw new Error(`not a valid direction: ${direction}`);
        }
    }
}

export class Pick extends Action {
    readonly itemName: string;
    readonly itemInfo: string;

    constructor(name: string, info: string) {
        super();
        this.itemName = name;
        this.itemInfo = info;
    }

    public override act(subject: Tile): void {
        const inventory = subject.getComponent(Inventory);
        log.tell(`You found ${this.itemInfo}`);
        const couldBeAdded = inventory.addItem(this.itemName);
        if (couldBeAdded) this.object.markForDestruction();
    }
}
