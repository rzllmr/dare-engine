import { Tile } from '../entities/tile';
import { SpecdComponent } from '../../engine/component';

export abstract class Action extends SpecdComponent {
    public get object(): Tile {
        return this.entity as Tile;
    }

    public async act(subject: Tile): Promise<void> {}

    public async leave(subject: Tile): Promise<void> {}

    protected decapitalize(line: string): string {
        return line.charAt(0).toLowerCase() + line.slice(1);
    }
}
