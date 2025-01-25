import { Point, Assets } from 'pixi.js';
import { Entity } from '../../engine/entity';
import { Action, Move, Pick, Open, Push, Tell, Fight, ActionSpecs } from '../components/actions';
import { Inventory } from '../components/inventory';
import { Graphic } from '../components/graphic';
import { EntityData, readEntity } from '../../engine/schemes';

export class Tile extends Entity {
    private static _data?: Map<string, EntityData>;
    public static get data(): Map<string, EntityData> {
        if (this._data === undefined) {
            const creatures = Assets.get('elements.creatures');
            const items = Assets.get('elements.items');
            const meta = Assets.get('elements.meta');
            const objects = Assets.get('elements.objects');
            const aggregate = new Map<string, Map<string, string>>([...creatures, ...items, ...meta, ...objects]);

            this._data = new Map();
            aggregate.forEach((value, key) => {
                this._data?.set(key, readEntity(value));
            });
        }
        return this._data;
    }

    public static removeFromMap: (tile: Tile) => void;
    public static moveOnMap: (direction: Point, actor: Tile) => Promise<boolean>;

    public moving = false;

    private readonly _name: string;
    private readonly data: EntityData;

    constructor(name: string, position: Point, subtile = '') {
        super();

        const specifics = name.match(/\s\((.+)\)$/)?.at(1) ?? '';
        if (specifics !== null) name = name.replace(` (${specifics})`, '');

        const tileData = Tile.data.get(name);
        if (tileData === undefined) throw new Error(`unknown entity: ${name}`);

        this._name = name;
        this.data = tileData;
        this.data.image ||= 'empty';
        this.addComponent(new Graphic(this.data.image.replace('*', subtile), position));
        this.addComponent(new Move(this.data.pass));
        this.graphic.hideInDark = false;

        if (name == 'player') this.initPlayer();
        else this.init(specifics);
    }

    private init(specifics: string): void {
        for (const [action, specs] of this.data.actions) {
            const actionSpecs = new ActionSpecs(specs);
            actionSpecs.fillIn(specifics);
            let component;
            switch(action) {
                case 'pick':
                    component = new Pick(actionSpecs);
                    break;
                case 'open':
                    component = new Open(actionSpecs);
                    break;
                case 'push':
                    component = new Push(actionSpecs);
                    break;
                case 'tell':
                    component = new Tell(actionSpecs);
                    break;
                case 'fight':
                    component = new Fight(actionSpecs);
                    break;
                default:
                    console.error(`unknown action: ${action}`);
                    continue;
            }
            this.addComponent(component);
        }
    }

    private initPlayer(): void {
        this.graphic.show();
        this.addComponent(new Inventory());
    }

    private destroy(): void {
        Tile.removeFromMap(this);
        this.components.length = 0;
    }

    public move(direction: Point): Promise<boolean> {
        return Tile.moveOnMap(direction, this);
    }

    private toBeDestroyed = false;
    public markForDestruction(): void {
        this.toBeDestroyed = true;
    }

    public async leave(subject: Tile): Promise<void> {
        for (const component of this.components) {
            if (component instanceof Action) {
                await component.leave(subject);
            }
        }
        if (this.toBeDestroyed) this.destroy();
    }

    public async act(subject: Tile): Promise<void> {
        for (const component of this.components) {
            if (component instanceof Action) {
                await component.act(subject);
            }
        }
        if (this.toBeDestroyed) this.destroy();
    }

    public get graphic(): Graphic {
        return this.getComponent(Graphic);
    }

    public get blocksView(): boolean {
        return ['wall', 'door'].includes(this.kind);
    }

    public get name(): string {
        return this._name;
    }

    public get image(): string {
        return this.graphic.image;
    }

    public get kind(): string {
        return this.name;
    }

    public get info(): string {
        return this.data.info;
    }
}
