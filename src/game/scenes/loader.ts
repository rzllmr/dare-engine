import { Container, Graphics, Assets, Point } from 'pixi.js';
import { manifest } from '../assets';
import { IScene, manager } from '../../engine/manager';
import { GameScene } from './game';
import { yamlParser } from '../../extensions/yamlParser';
import { htmlParser } from '../../extensions/htmlParser';
import { markdownParser } from '../../extensions/markdownParser';
import { inkParser } from '../../extensions/inkParser';

export class LoaderScene extends Container implements IScene {
    private readonly loaderBar: Container;
    private readonly loaderBarBorder: Graphics;
    private readonly loaderBarFill: Graphics;
    constructor() {
        super();

        const loaderBarWidth = manager.width * 0.8;

        this.loaderBarFill = new Graphics();
        this.loaderBarFill.beginFill(0x008800, 1);
        this.loaderBarFill.drawRect(0, 0, loaderBarWidth, 50);
        this.loaderBarFill.endFill();
        this.loaderBarFill.scale.x = 0;

        this.loaderBarBorder = new Graphics();
        this.loaderBarBorder.lineStyle(10, 0x0, 1);
        this.loaderBarBorder.drawRect(0, 0, loaderBarWidth, 50);

        this.loaderBar = new Container();
        this.loaderBar.addChild(this.loaderBarFill);
        this.loaderBar.addChild(this.loaderBarBorder);
        this.loaderBar.position.x = (manager.width - this.loaderBar.width) / 2;
        this.loaderBar.position.y = (manager.height - this.loaderBar.height) / 2;
        this.addChild(this.loaderBar);

        this.initializeLoader().then(
            () => {
                this.gameLoaded();
            },
            () => {}
        );
    }

    private async initializeLoader(): Promise<void> {
        Assets.loader.parsers.push(yamlParser);
        Assets.loader.parsers.push(htmlParser);
        Assets.loader.parsers.push(markdownParser);
        Assets.loader.parsers.push(inkParser);

        await Assets.init({ manifest: manifest });

        const bundleIds = manifest.bundles.map((bundle) => bundle.name);

        await Assets.loadBundle(bundleIds, this.downloadProgress.bind(this));
    }

    private downloadProgress(progressRatio: number): void {
        this.loaderBarFill.scale.x = progressRatio;
    }

    private gameLoaded(): void {
        const version: string = Assets.get('version');
        const versionDiv = document.querySelector('#version') as HTMLDivElement;
        versionDiv.textContent = version;

        const gameScene = new GameScene();
        console.log(`${gameScene.gameName} v${version}`);

        manager.changeScene(gameScene);
    }

    public input(position: Point, button?: string): void {}

    public update(framesPassed: number): void {}
}
