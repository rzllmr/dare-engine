import { Tile } from 'game/entities/tile';
import { log } from 'game/proxies/log';
import { Action } from './action';
import { addComponent } from './registry';

export class Fight extends Action {
    public override async act(subject: Tile): Promise<void> {
        log.tell(`You fight ${this.decapitalize(this.object.info)}`);
        const defeated = false;
        if (defeated) this.object.markForDestruction();
    }
}

addComponent('fight', Fight);
