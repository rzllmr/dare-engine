import { Point, Assets } from 'pixi.js';
import { Entity } from '../../engine/entity';
import { Action, Move, Pick, Open, Push, Tell, Fight } from '../components/actions';
import { Inventory } from '../components/inventory';
import { Graphic } from '../components/graphic';
import { EntityData, readEntity } from '../../engine/schemes';

export class Tile extends Entity {
    private static _data?: Map<string, EntityData>;
    public static get data(): Map<string, EntityData> {
        if (this._data === undefined) {
            const creatures = Assets.get('entities.creatures');
            const items = Assets.get('entities.items');
            const meta = Assets.get('entities.meta');
            const surroundings = Assets.get('entities.surroundings');
            const aggregate = new Map<string, Map<string, string>>([...creatures, ...items, ...meta, ...surroundings]);

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

        const details = name.match(/\s\((.+)\)$/)?.at(1) ?? '';
        if (details !== null) name = name.replace(` (${details})`, '');

        const tileData = Tile.data.get(name);
        if (tileData === undefined) throw new Error(`unknown entity: ${name}`);

        this._name = name;
        this.data = tileData;
        this.addComponent(new Graphic(this.data.image.replace('*', subtile), position));
        this.addComponent(new Move());
        this.initKind(this.kind, details);
    }

    private initKind(kind: string, details: string): void {
        switch (kind) {
            case 'player':
                this.graphic.show();
                this.addComponent(new Inventory());
                break;
            case 'enemy':
                this.graphic.hideInDark = true;
                this.addComponent(new Fight());
                break;
            case 'item':
                this.graphic.hideInDark = true;
                this.getComponent(Move).pass = true;
                this.addComponent(new Pick());
                break;
            case 'container':
                this.addComponent(new Open(details));
                this.addComponent(new Pick(details));
                break;
            case 'floor':
                this.getComponent(Move).pass = true;
                break;
            case 'door':
                this.getComponent(Move).pass = true;
                this.addComponent(new Open(details));
                break;
            case 'crate':
                this.addComponent(new Push());
                break;
            case 'sign':
                this.addComponent(new Tell());
                break;
            case 'chasm':
                break;
            case 'wall':
                break;
            case 'meta':
                break;
            default:
                console.error(`unknown kind: ${kind}`);
        }
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
        return this.data.kind;
    }

    public get info(): string {
        return this.data.info;
    }

    public get specs(): any {
        return this.data.specs;
    }
}
