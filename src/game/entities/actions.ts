import { Tile } from './tile';
import { Point } from 'pixi.js';
import { IComponent } from '../../component';
import { Entity } from '../../entity';

export abstract class Action implements IComponent {
    public Entity: Entity | null = null;

    public act(subject: Tile): void {}
}

export class Move extends Action {
    public override act(subject: Tile): void {
        const object = this.Entity as Tile;
        subject.position = object.position;
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
