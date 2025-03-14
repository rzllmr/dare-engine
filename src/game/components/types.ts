import { Component } from 'engine/component';
import { ComponentSpecs } from 'engine/specs';
import { storage, storageTypes } from 'engine/storage';
import { Tile } from 'game/entities/tile';

export class SpecdComponent extends Component {
    public get object(): Tile {
        return this.entity as Tile;
    }

    public get id(): string {
        return (this.object.id + '/' + this.constructor.name).toLowerCase();
    }

    protected load(name: string, defaultValue?: any): any {
        return storage.load(`${this.id}/${name}`, defaultValue);
    }

    protected save(name: string, value: storageTypes): void {
        return storage.save(`${this.id}/${name}`, value);
    }

    protected delete(name: string): void {
        storage.delete(`${this.id}/${name}`);
    }

    protected specs: ComponentSpecs;
    constructor(specs = new ComponentSpecs(), briefSpec = 'brief') {
        super();
        this.specs = specs;
        this.specs.assignBrief(briefSpec);
    }
}

export abstract class Action extends SpecdComponent {
    public async act(subject: Tile): Promise<void> {}

    public async leave(subject: Tile): Promise<void> {}

    protected decapitalize(line: string): string {
        return line.charAt(0).toLowerCase() + line.slice(1);
    }
}
