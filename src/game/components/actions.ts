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

    protected decapitalize(line: string): string {
        return line.charAt(0).toLowerCase() + line.slice(1);
    }
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
    public override async act(subject: Tile): Promise<void> {
        const inventory = subject.getComponent(Inventory);
        log.tell(`You found ${this.decapitalize(this.object.info)}`);
        const couldBeAdded = inventory.addItem(this.object.name, this.object.specs);
        if (couldBeAdded) this.object.markForDestruction();
    }
}
