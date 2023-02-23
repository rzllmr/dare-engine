import { Point } from 'pixi.js';
import { Entity } from '../../entity';
import { Action, Move, Pick } from '../components/actions';
import tilesData from './tiles.json';
import { Inventory } from '../components/inventory';
import { Graphic } from '../components/graphic';
import { TileInfo } from './map';

interface TileData {
    name: string;
    image: string;
    symbol: string;
    kind: string;
    specific: string;
}

export class Tile extends Entity {
    private readonly data!: TileData;

    constructor(name: string, position: Point, specific?: TileInfo) {
        super();

        const tileData = (tilesData as TileData[]).find((tile) => {
            return tile.name === name;
        });
        if (tileData === undefined) throw new Error(`tile name unknown: ${name}`);

        this.data = tileData;
        this.addComponent(new Graphic(this.image, position));
        this.initKind(this.kind, specific);
    }

    private initKind(kind: string, specific?: TileInfo): void {
        switch (kind) {
            case 'player':
                this.getComponent(Graphic).alpha = { start: 1.0, show: 1.0, hide: 0.3 };
                this.addComponent(new Inventory());
                break;
            case 'enemy':
                this.getComponent(Graphic).alpha = { start: 0.0, show: 1.0, hide: 0.0 };
                break;
            case 'item':
                if (specific === undefined) break;
                this.getComponent(Graphic).alpha = { start: 0.0, show: 1.0, hide: 0.0 };
                this.addComponent(new Pick(specific));
                this.getComponent(Pick);
                this.addComponent(new Move());
                break;
            case 'pass':
                this.addComponent(new Move());
                break;
            case 'door':
                this.addComponent(new Move());
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

    public act(subject: Tile): void {
        for (const component of this.components) {
            if (component instanceof Action) {
                component.act(subject);
            }
        }
    }

    public get graphic(): Graphic {
        return this.getComponent(Graphic);
    }

    public get blocksView(): boolean {
        return ['block', 'door'].includes(this.kind);
    }

    public get name(): string {
        return this.data.name;
    }

    public get symbol(): string {
        return this.data.symbol;
    }

    public get image(): string {
        return this.data.image;
    }

    public get kind(): string {
        return this.data.kind;
    }

    private static _charMap: Map<string, TileData> | undefined;
    public static get charMap(): Map<string, TileData> {
        if (Tile._charMap === undefined) {
            Tile._charMap = new Map<string, TileData>();
            for (const tile of tilesData as TileData[]) {
                Tile._charMap.set(tile.symbol, tile);
            }
        }
        return Tile._charMap;
    }
}
