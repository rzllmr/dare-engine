import { Point } from 'pixi.js';
import { Entity } from 'engine/entity';
import { EntitySpecs } from 'engine/specs';
import { storage, storageTypes } from 'engine/storage';
import { Graphic, Info } from 'game/components';
import { createComponent } from 'game/components/registry';
import { Action } from 'game/components/types';
import { TileMap } from './map';

export class Tile extends Entity {
    public static map: TileMap;

    public moving = false;

    private readonly specs: EntitySpecs;
    public readonly id: string;

    constructor(name: string, coord: Point, details: string = '') {
        super();

        this.id = `${Tile.map.label}/${name}[${coord.x},${coord.y}]`;
        if (name == 'player') this.id = name;

        this.specs = EntitySpecs.get(name);
        this.specs.fillIn(details);

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
        this.components.forEach((component) => {component.init()});
    }

    protected load(name: string, defaultValue?: any): any {
        return storage.load(`${this.id}/${name}`, defaultValue);
    }

    protected save(name: string, value: storageTypes): void {
        return storage.save(`${this.id}/${name}`, value);
    }

    private destroy(): void {
        Tile.map.remove(this);
        this.components.length = 0;
        this.save('destroyed', true);
    }

    public get destroyed(): boolean {
        return this.load('destroyed', false);
    }

    public move(direction: Point): Promise<boolean> {
        return Tile.map.move(direction, this);
    }

    public destroyLater(): void {
        Tile.map.afterMove(() => {
            this.destroy();
        });
    }

    public async leave(subject: Tile): Promise<void> {
        for (const component of this.components) {
            if (component instanceof Action) {
                await component.leave(subject);
            }
        }
    }

    public async act(subject: Tile): Promise<void> {
        for (const component of this.components) {
            if (component instanceof Action) {
                await component.act(subject);
            }
        }
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
