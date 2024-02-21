import { Container, Point } from 'pixi.js';
import { IScene } from '../../manager';
import { TileMap } from '../entities/map';
import { Move } from '../components/actions';

export class GameScene extends Container implements IScene {
    public gameName = 'Dare';
    private readonly tileMap: TileMap;
    private readonly offset: Point;

    constructor() {
        super();

        const canvas = document.querySelector('#pixi-canvas') as HTMLCanvasElement;
        this.offset = new Point(canvas.offsetLeft, canvas.offsetTop);

        this.tileMap = new TileMap('map.test');
        this.addChild(this.tileMap);
        this.tileMap.load();
    }

    public input(position: Point, button?: string): void {
        if (button === undefined) {
            this.tileMap.highlight(new Point(position.x - this.offset.x, position.y - this.offset.y));
            return;
        }

        if (button.startsWith('Arrow')) {
            const direction = button.replace('Arrow', '');
            this.tileMap.move('player', Move.direction(direction));
        }
    }

    public update(framesPassed: number): void {}
}
