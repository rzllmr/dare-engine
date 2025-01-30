import { Tile } from '../entities/tile';
import { Point } from 'pixi.js';
import { SpecdComponent } from '../../engine/component';
import { Inventory, Item } from './inventory';
import { Graphic } from './graphic';
import log from '../proxies/log';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Animation } from '../../engine/animation';
import dialog from 'game/proxies/dialog';
import { EntitySpecs, ComponentSpecs } from 'engine/specs';
import { addComponent } from './registry';

export abstract class Action extends SpecdComponent {
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
    private readonly speed = 200; // in seconds

    constructor(specs: ComponentSpecs) {
        super(specs, 'pass');
    }

    public get pass(): boolean {
        return this.specs.get('pass', false);
    }
    public set pass(value: boolean) {
        this.specs.set('pass', value);
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
addComponent('move', Move, true);

export class Info extends Action {
    private _text: string;

    constructor(specs: ComponentSpecs) {
        super(specs, 'text');

        this._text = this.text;
    }

    public change(text = ''): void {
        this._text = text;
    }

    public show(): void {
        dialog.tell(this._text);
    }

    public get text(): string {
        return this.specs.get('text', '');
    }
}
addComponent('info', Info);

export class Pick extends Action {
    private readonly items: Item[] = [];
    private readonly destroyObject: boolean = true;

    constructor(specs: ComponentSpecs) {
        super(specs);

        for (const itemName of this.item) {
            const itemSpecs = EntitySpecs.get(itemName);

            const infoText = itemSpecs.component('info')?.get('brief', '') || '';
            const pickSpecs = itemSpecs.component('pick');
            this.items.push(new Item(itemName, infoText, pickSpecs));
            this.destroyObject = false;
        }
    }

    public override init(): void {
        if (this.items.length == 0) {
            this.items.push(new Item(this.object.name, this.object.info, this.specs));
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

    public get item(): string[] {
        return this.specs.get('item', []);
    }

    public get take(): string[] {
        return this.specs.get('take', []);
    }

    public get equip(): string[] {
        return this.specs.get('equip', []);
    }

    public get part(): string {
        return this.specs.get('part', '');
    }
}
addComponent('pick', Pick);

export class Open extends Action {
    private readonly requiredItems: string[] = [];

    constructor(specs: ComponentSpecs) {
        super(specs);

        if (this.need.length > 0) this.requiredItems = this.need;
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

    public get need(): string[] {
        return this.specs.get('need', []);
    }
}
addComponent('open', Open);

export class Push extends Action {
    public override async act(subject: Tile): Promise<void> {
        if (subject.name !== 'player') return;

        const direction = this.object.graphic.position.subtract(subject.graphic.position);
        await this.object.move(direction);
    }
}
addComponent('push', Push);

export class Tell extends Action {
    constructor(specs: ComponentSpecs) {
        super(specs, 'text');
    }

    public override async act(subject: Tile): Promise<void> {
        if (subject.name !== 'player') return;

        log.tell(this.text);
    }

    public get text(): string {
        return this.specs.get('text', '');
    }
}
addComponent('tell', Tell);

export class Fight extends Action {
    public override async act(subject: Tile): Promise<void> {
        log.tell(`You fight ${this.decapitalize(this.object.info)}`);
        const defeated = false;
        if (defeated) this.object.markForDestruction();
    }
}
addComponent('fight', Fight);
