import { Container, Point } from 'pixi.js';
import { IScene } from 'engine/manager';
import { utils } from 'engine/utils';
import { Move } from 'game/components/move';
import { TileMap } from 'game/entities/map';
import { book } from 'game/proxies/book';
import init_wasm from "fast/wasm/pkg/fast_functions";

export class GameScene extends Container implements IScene {
    public gameName = 'Dare';
    public startingLevel = 'level.demo';

    private readonly offset: Point;
    private tileMap!: TileMap;

    constructor() {
        super();

        const canvas = document.querySelector('#pixi-canvas') as HTMLCanvasElement;
        this.offset = utils.elementOffset(canvas);
    }

    public async load(): Promise<void> {
        await init_wasm();
        await book.load();
        await this.changeMap(this.startingLevel);
    }

    public async changeMap(mapName: string): Promise<void> {
        if (this.tileMap !== undefined) {
            this.removeChild(this.tileMap);
        }
        this.tileMap = new TileMap(mapName);
        await this.tileMap.load();
        this.addChild(this.tileMap);
    }

    public input(position: Point, button?: string): void {
        if (button === undefined) {
            this.tileMap.highlight(position, this.offset);
            return;
        }

        if (button.startsWith('Arrow')) {
            const direction = button.replace('Arrow', '');
            this.tileMap.move(Move.direction(direction));
        } else if (button.endsWith('Swipe')) {
            const direction = button.replace('Swipe', '');
            book.changeTab(direction);
        }
    }

    public update(lastTime: number): void {}
}
