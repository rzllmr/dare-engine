import { Tile } from '../entities/tile';
import { Point } from 'pixi.js';
import { IComponent } from '../../component';
import { Entity } from '../../entity';
import { Inventory } from './inventory';
import { Graphic } from './graphic';
import log from '../../log';
import { TileInfo } from '../entities/map';

export abstract class Action implements IComponent {
    public entity: Entity | null = null;

    public act(subject: Tile): void {}
}

export class Move extends Action {
    public override act(subject: Tile): void {
        const object = this.entity as Tile;
        subject.getComponent(Graphic).position = object.getComponent(Graphic).position;
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
    readonly itemInfo: TileInfo;

    constructor(itemInfo: TileInfo) {
        super();
        this.itemInfo = itemInfo;
    }

    public override act(subject: Tile): void {
        const inventory = subject.getComponent(Inventory);
        log.tell(`You found ${this.itemInfo.description}`);
        inventory.addItem(this.itemInfo.name);
    }
}
