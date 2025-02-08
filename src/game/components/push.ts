import { Tile } from 'game/entities/tile';
import { addComponent } from './registry';
import { Action } from './types';

export class Push extends Action {
    public override async act(subject: Tile): Promise<void> {
        if (subject.name !== 'player') return;

        const direction = this.object.graphic.position.subtract(subject.graphic.position);
        await this.object.move(direction);
    }
}

addComponent('push', Push);
