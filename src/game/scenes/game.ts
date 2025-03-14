import { Container, Point } from 'pixi.js';
import { IScene } from 'engine/manager';
import { settings } from 'engine/settings';
import { utils } from 'engine/utils';
import { Move } from 'game/components/move';
import { TileMap } from 'game/entities/map';
import { book } from 'game/proxies/book';
import init_wasm from "fast/wasm/pkg/fast_functions";

export class GameScene extends Container implements IScene {
    public gameName: string;
    public start: {level: string, spawn: string};

    private readonly offset: Point;
    private tileMap!: TileMap;

    constructor() {
        super();

        this.gameName = settings.get('game.name');
        this.start = {
            level: settings.get('start.level'),
            spawn: settings.get('start.spawn')
        }

        const canvas = document.querySelector('#pixi-canvas') as HTMLCanvasElement;
        this.offset = utils.elementOffset(canvas);
    }

    public async load(): Promise<void> {
        await init_wasm();
        await book.load();
        await this.changeMap(this.start.level, this.start.spawn);
    }

    public async changeMap(level: string, spawn: string): Promise<void> {
        const tileMap = new TileMap(level);
        TileMap.changeMap = this.changeMap.bind(this);
        if (!TileMap.available(level, spawn) || ! await tileMap.load(spawn)) {
            console.error(`could not load: ${level}`);
            return;
        }

        if (this.tileMap !== undefined) {
            settings.set('start.level', level);
            settings.set('start.spawn', spawn);
            this.removeChild(this.tileMap);
        }
        this.tileMap = tileMap;
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
