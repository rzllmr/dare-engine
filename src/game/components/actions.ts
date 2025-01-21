import { Tile } from '../entities/tile';
import { Point } from 'pixi.js';
import { Component } from '../../engine/component';
import { Inventory, Item } from './inventory';
import { Graphic } from './graphic';
import log from '../proxies/log';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Animation } from '../../engine/animation';

export abstract class Action extends Component {
    public get object(): Tile {
        return this.entity as Tile;
    }

    public async act(subject: Tile): Promise<void> {}

    public async leave(subject: Tile): Promise<void> {}

    protected decapitalize(line: string): string {
        return line.charAt(0).toLowerCase() + line.slice(1);
    }

    private filter(details: string, pattern: RegExp): string[] {
        const defines: string[] = [];
        for (const detail of details.split(/,\s*/)) {
            if (detail !== '' && detail.match(pattern)) {
                defines.push(detail.replace('?', ''));
            }
        }
        return defines;
    }

    protected requireds(details: string): string[] {
        return this.filter(details, /.+\?$/);
    }

    protected defines(details: string): string[] {
        return this.filter(details, /.+[^?]$/);
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
        tween.onUpdate((current) => { subject.getComponent(Graphic).realPos = current; });
        await new Animation(tween).run();

        if (this.pass) subject.graphic.sprite.zIndex = this.object.graphic.position.y + 0.5;
    }

    private step(start: Point, end: Point): Tween<any> {
        return new Tween(start).to(end).duration(this.speed).easing(Easing.Sinusoidal.InOut);
    }

    private bounce(start: Point, end: Point): Tween<any> {
        const target = new Point(
            start.x + ( end.x - start.x ) / 3,
            start.y + ( end.y - start.y ) / 3
        );
        return new Tween(start).to(target).duration(this.speed).easing(Easing.Sinusoidal.InOut).repeat(1).yoyo(true);
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
    private readonly items: Item[] = [];
    private readonly destroyObject: boolean = true;

    constructor(details = '') {
        super();

        const itemNames = this.defines(details);
        if (itemNames.length > 0) {
            for (const itemName of itemNames) {
                const data = Tile.data.get(itemName);
                if (data === undefined) throw new Error(`unknown item: ${itemName}`);

                this.items.push(new Item(itemName, data.info, data.specs));
                this.destroyObject = false;
            }
        }
    }

    public override init(): void {
        if (this.items.length == 0) {
            this.items.push(new Item(this.object.name, this.object.info, this.object.specs));
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
            if (couldBeAdded) this.items.splice(i, 1);
        }
        if (this.items.length == 0 && this.destroyObject) this.object.markForDestruction();

    }
}

export class Open extends Action {
    private readonly requiredItems: string[] = [];

    constructor(details = '') {
        super();

        const requiredItems = this.requireds(details);
        if (requiredItems.length > 0) this.requiredItems = requiredItems;
    }

    public override init(): void {
        if (this.requiredItems.length > 0) {
            this.object.getComponent(Move).pass = false;
        }
    }

    public override async act(subject: Tile): Promise<void> {
        if (this.object.image.endsWith('c')) {
            if (this.requiredItems.length > 0) {
                if (!subject.hasComponent(Inventory)) return;
                const inventory = subject.getComponent(Inventory);
                if (this.requiredItems.every((item) => { return inventory.hasItem(item) })) {
                    log.tell(`You unlocked the ${this.object.name} with the ${this.requiredItems.join(', ')}.`);
                    this.requiredItems.length = 0;
                } else {
                    log.tell(`The ${this.object.name} seems locked and needs a ${this.requiredItems.join(', ')}.`);
                    return;
                }
            }
            
            const openSprite = this.object.image.replace(/c$/, 'o');
            this.object.graphic.changeSprite(openSprite);
            this.object.getComponent(Move).pass = true;
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
