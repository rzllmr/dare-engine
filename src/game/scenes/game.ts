import { Container, Point } from 'pixi.js';
import { IScene } from '../../manager';
import { TileMap } from '../entities/map';
import { Move } from '../components/actions';

export class GameScene extends Container implements IScene {
    private readonly tileMap: TileMap;

    constructor() {
        super();

        this.tileMap = new TileMap('map.test');
        this.tileMap.position = new Point(40, 40);
        this.addChild(this.tileMap);
        this.tileMap.load();
    }

    public input(position: Point, button?: string): void {
        if (button === undefined) {
            this.tileMap.highlight(position);
            return;
        }

        if (button.startsWith('Arrow')) {
            const direction = button.replace('Arrow', '');
            this.tileMap.move('player', Move.direction(direction));
        }
    }

    public update(framesPassed: number): void {}
}
