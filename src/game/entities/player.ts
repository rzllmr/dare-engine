import { Tile } from './tile'

export abstract class Creature extends Tile {
    public posX = 0;
    public posY = 0;
}

export class Player extends Creature {
    constructor(posX: number, posY: number) {
        super("player");

        this.posX = posX;
        this.posY = posY;
    }
}
