import { Component } from 'engine/component';
import { ComponentSpecs } from 'engine/specs';
import { Tile } from 'game/entities/tile';

export class SpecdComponent extends Component {
    public get object(): Tile {
        return this.entity as Tile;
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
