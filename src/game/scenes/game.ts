import { Container, Point } from 'pixi.js';
import { IScene } from '../../manager';
import { TileMap } from '../entities/map';
import { Move } from '../components/actions';

export class GameScene extends Container implements IScene {
    private readonly tileMap: TileMap;

    constructor() {
        super();

        this.tileMap = new TileMap('map.fov');
        this.tileMap.position = new Point(40, 40);
        this.addChild(this.tileMap);
        this.tileMap.load();
    }

    public input(key: string): void {
        if (key.startsWith('Arrow')) {
            const direction = key.replace('Arrow', '');
            this.tileMap.move('player', Move.direction(direction));
        }
    }

    public update(framesPassed: number): void {}
}
