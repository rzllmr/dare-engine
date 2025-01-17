import { Tile } from '../entities/tile';
import { Point } from 'pixi.js';
import { Component } from '../../engine/component';
import { Inventory, Item } from './inventory';
import { Graphic } from './graphic';
import log from '../proxies/log';
import { Tween, Easing } from '@tweenjs/tween.js';
import animation from '../../engine/animation';

export abstract class Action extends Component {
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
            subject.getComponent(Graphic).realPos = subjectPos.clone();
        });
        tween.start();

        animation.add(tween.update, tween);
        await new Promise((resolve) => tween.onComplete(resolve)).then(() => {
            if (this.pass) subject.graphic.sprite.zIndex = this.object.graphic.position.y + 0.5;
        });
    }

    private step(start: Point, end: Point): Tween<any> {
        return new Tween(start).to(end, this.speed).easing(Easing.Sinusoidal.InOut);
    }

    private bounce(start: Point, end: Point): Tween<any> {
        const target = {
            x: start.x + ( end.x - start.x ) / 3,
            y: start.y + ( end.y - start.y ) / 3
        };
        return new Tween(start).to(target, this.speed).easing(Easing.Sinusoidal.InOut).repeat(1).yoyo(true);
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
    private item: Item | undefined;
    private readonly destroyObject: boolean = true;

    constructor(itemName = '') {
        super();

        if (itemName !== '') {
            const data = Tile.data.get(itemName);
            if (data === undefined) throw new Error(`unknown item: ${itemName}`);

            this.item = new Item(itemName, data.info, data.specs);
            this.destroyObject = false;
        }
    }

    public override init(): void {
        if (this.item === undefined) {
            this.item = new Item(this.object.name, this.object.info, this.object.specs);
        }
    }

    public override async act(subject: Tile): Promise<void> {
        if (this.item === undefined) return;

        const inventory = subject.getComponent(Inventory);
        log.tell(`You found ${this.decapitalize(this.item.info)}`);
        const couldBeAdded = inventory.addItem(this.item);
        if (couldBeAdded) {
            this.item = undefined;
            if (this.destroyObject) this.object.markForDestruction();
        }
    }
}

export class Open extends Action {
    public override async act(subject: Tile): Promise<void> {
        if (this.object.image.endsWith('c')) {
            const openSprite = this.object.image.replace(/c$/, 'o');
            this.object.graphic.changeSprite(openSprite);
        }
    }

    public override async leave(subject: Tile): Promise<void> {
        if (this.object.image.endsWith('o')) {
            const openSprite = this.object.image.replace(/o$/, 'c');
            this.object.graphic.changeSprite(openSprite);
        }
    }
}

export class Fight extends Action {
    public override async act(subject: Tile): Promise<void> {
        log.tell(`You fight ${this.decapitalize(this.object.info)}`);
        const defeated = false;
        if (defeated) this.object.markForDestruction();
    }
}
