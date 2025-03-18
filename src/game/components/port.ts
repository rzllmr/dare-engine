import { ComponentSpecs } from 'engine/specs';
import { Tile } from 'game/entities/tile';
import { addComponent } from './registry';
import { Action } from './types';

export class Port extends Action {
    constructor(specs: ComponentSpecs) {
        super(specs, 'where');
    }

    public override async act(subject: Tile): Promise<void> {
        if (this.where == undefined) {
            console.error(`port component missing "where": ${this.object.name}`);
            return;
        }

        const target = this.where.split('.');
        Tile.map.changeLater(`levels.${target[0]}`, target[1]);
    }

    public get where(): string | undefined {
        return this.specs.get('where', []).at(0);
    }
}

addComponent('port', Port);
