import { Point } from 'pixi.js';
import { Entity } from '../../engine/entity';
import { EntitySpecs } from '../../engine/specs';
import { Action } from '../components/action';
import { Graphic, Info } from '../components';
import { createComponent } from '../components/registry';

export class Tile extends Entity {
    public static removeFromMap: (tile: Tile) => void;
    public static moveOnMap: (direction: Point, actor: Tile) => Promise<boolean>;

    public moving = false;

    private readonly specs: EntitySpecs;

    constructor(name: string, position: Point, subtile = '') {
        super();

        const mapDetails = name.match(/\s\((.+)\)$/)?.at(1) ?? '';
        if (mapDetails !== null) name = name.replace(` (${mapDetails})`, '');

        this.specs = EntitySpecs.get(name);
        this.specs.fillIn(mapDetails);

        this.specs.component('sprite')?.set('position', position);
        this.specs.component('sprite')?.set('subtile', subtile);

        this.attachComponents();
        if (name == 'player') this.graphic.show();
    }

    private attachComponents(): void {
        for (const [name, componentSpecs] of this.specs.components) {
            const component = createComponent(name, componentSpecs);
            if (component == undefined) {
                console.error(`unknown action: ${name} (on ${this.name})`);
                continue;
            }
            this.addComponent(component);
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
        return this.specs.name;
    }

    public get image(): string {
        return this.graphic.image;
    }

    public get kind(): string {
        return this.name;
    }

    public get info(): string { 
        return this.hasComponent(Info) ? this.getComponent(Info).text : '';
    }
}
