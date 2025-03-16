import { Tile } from 'game/entities/tile';
import { log } from 'game/proxies/log';
import { addComponent } from './registry';
import { Action } from './types';

export class Fight extends Action {
    public override async act(subject: Tile): Promise<void> {
        log.tell(`You fight ${this.decapitalize(this.object.info)}`);
        const defeated = false;
        if (defeated) this.object.destroyLater();
    }
}

addComponent('fight', Fight);
