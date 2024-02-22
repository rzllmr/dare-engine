import { Point, Assets } from 'pixi.js';
import { Entity } from '../../entity';
import { Action, Move, Pick, Fight } from '../components/actions';
import { Inventory } from '../components/inventory';
import { Graphic } from '../components/graphic';
import { EntityData, readEntity } from '../../schemes';

export class Tile extends Entity {
    private static _data?: Map<string, EntityData>;
    private static get data(): Map<string, EntityData> {
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

    private readonly _name: string;
    private readonly data: EntityData;

    constructor(name: string, position: Point) {
        super();

        const tileData = Tile.data.get(name);
        if (tileData === undefined) throw new Error(`entity unknown: ${name}`);

        this._name = name;
        this.data = tileData;
        this.addComponent(new Graphic(this.image, position));
        this.addComponent(new Move());
        this.initKind(this.kind);
    }

    private initKind(kind: string): void {
        switch (kind) {
            case 'player':
                this.getComponent(Graphic).alpha = { start: 1.0, show: 1.0, hide: 0.3 };
                this.addComponent(new Inventory());
                break;
            case 'enemy':
                this.getComponent(Graphic).alpha = { start: 0.0, show: 1.0, hide: 0.0 };
                this.addComponent(new Fight());
                break;
            case 'item':
                this.getComponent(Graphic).alpha = { start: 0.0, show: 1.0, hide: 0.0 };
                this.getComponent(Move).pass = true;
                this.addComponent(new Pick());
                break;
            case 'pass':
                this.getComponent(Move).pass = true;
                break;
            case 'door':
                this.getComponent(Move).pass = true;
                break;
            case 'chasm':
                break;
            case 'block':
                break;
            case 'meta':
                this.getComponent(Graphic).alpha = { start: 0.0, show: 1.0, hide: 0.0 };
                break;
            default:
                console.error(`unknown kind: ${kind}`);
        }
    }

    private destroy(): void {
        Tile.removeFromMap(this);
        this.components.length = 0;
    }

    private toBeDestroyed = false;
    public markForDestruction(): void {
        this.toBeDestroyed = true;
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
        return ['block', 'door'].includes(this.kind);
    }

    public get name(): string {
        return this._name;
    }

    public get image(): string {
        return this.data.image;
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
