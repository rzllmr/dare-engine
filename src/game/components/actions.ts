import { Tile } from '../entities/tile';
import { Point } from 'pixi.js';
import { IComponent } from '../../engine/component';
import { Inventory } from './inventory';
import { Graphic } from './graphic';
import log from '../proxies/log';
import { Entity } from '../../engine/entity';
import { Tween, Easing } from '@tweenjs/tween.js';
import animation from '../../engine/animation';

export abstract class Action implements IComponent {
    public entity: Entity | null = null;
    public get object(): Tile {
        return this.entity as Tile;
    }

    public async act(subject: Tile): Promise<void> {}

    public async leave(subject: Tile): Promise<void> {}

    protected decapitalize(line: string): string {
        return line.charAt(0).toLowerCase() + line.slice(1);
    }
}

export class Move extends Action {
    public pass: boolean;
    private readonly speed = 200; // in seconds

    constructor(pass: boolean = false) {
        super();
        this.pass = pass;
    }

    public override async act(subject: Tile): Promise<void> {
        const subjectPos = subject.getComponent(Graphic).realPos;
        const objectPos =  this.object.getComponent(Graphic).realPos;

        const tween = this.pass ? this.step(subjectPos, objectPos) : this.bounce(subjectPos, objectPos);
        tween.onUpdate(() => {
            subject.getComponent(Graphic).realPos = new Point(subjectPos.x, subjectPos.y);
        });
        tween.start();

        animation.add(tween.update, tween);
        await new Promise((resolve) => tween.onComplete(resolve));
    }

    private step(start: Point, end: Point): Tween<any> {
        return new Tween(start, false).to(end, this.speed).easing(Easing.Sinusoidal.InOut);
    }

    private bounce(start: Point, end: Point): Tween<any> {
        const target = {
            x: start.x + ( end.x - start.x ) / 3,
            y: start.y + ( end.y - start.y ) / 3
        };
        return new Tween(start, false).to(target, this.speed).easing(Easing.Sinusoidal.InOut).repeat(1).yoyo(true);
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

export class Fight extends Action {
    public override async act(subject: Tile): Promise<void> {
        log.tell(`You fight ${this.decapitalize(this.object.info)}`);
        const defeated = false;
        if (defeated) this.object.markForDestruction();
    }
}
