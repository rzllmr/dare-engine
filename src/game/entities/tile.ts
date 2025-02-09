import { Point } from 'pixi.js';
import { Entity } from 'engine/entity';
import { EntitySpecs } from 'engine/specs';
import { Graphic, Info } from 'game/components';
import { createComponent } from 'game/components/registry';
import { Action } from 'game/components/types';
import { TileMap } from './map';

export class Tile extends Entity {
    public static map: TileMap;

    public moving = false;

    private readonly specs: EntitySpecs;

    constructor(name: string, coord: Point) {
        super();

        const mapDetails = name.match(/\s\((.+)\)$/)?.at(1) ?? '';
        if (mapDetails !== null) name = name.replace(` (${mapDetails})`, '');

        this.specs = EntitySpecs.get(name);
        this.specs.fillIn(mapDetails);

        this.specs.component('sprite')?.set('coord', coord);

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
        Tile.map.remove(this);
        this.components.length = 0;
    }

    public move(direction: Point): Promise<boolean> {
        return Tile.map.move(direction, this);
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
