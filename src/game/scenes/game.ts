import { Container, Point } from 'pixi.js';
import { IScene } from '../../engine/manager';
import { TileMap } from '../entities/map';
import { Move } from '../components/actions';
import utils from '../../engine/utils';
import book from '../proxies/book';

export class GameScene extends Container implements IScene {
    public gameName = 'Dare';
    public startMap = 'map.test';

    private readonly offset: Point;
    private tileMap!: TileMap;

    constructor() {
        super();

        const canvas = document.querySelector('#pixi-canvas') as HTMLCanvasElement;
        this.offset = utils.elementOffset(canvas);

        book.load();
        this.changeMap(this.startMap);
    }

    public changeMap(mapName: string): void {
        if (this.tileMap !== undefined) {
            this.removeChild(this.tileMap);
        }
        this.tileMap = new TileMap(mapName);
        this.addChild(this.tileMap);
        this.tileMap.load();
    }

    public input(position: Point, button?: string): void {
        if (button === undefined) {
            this.tileMap.highlight(position, this.offset);
            return;
        }

        if (button.startsWith('Arrow')) {
            const direction = button.replace('Arrow', '');
            this.tileMap.move('player', Move.direction(direction));
        } else if (button.endsWith('Swipe')) {
            const direction = button.replace('Swipe', '');
            book.changeTab(direction);
        }
    }

    public update(lastTime: number): void {}
}
