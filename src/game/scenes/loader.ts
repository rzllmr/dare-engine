import { Container, Graphics, Assets } from 'pixi.js';
import { manifest } from '../assets';
import { IScene, manager } from '../../manager';
import { GameScene } from './game';

export class LoaderScene extends Container implements IScene {
    // for making our loader graphics...
    private readonly loaderBar: Container;
    private readonly loaderBarBoder: Graphics;
    private readonly loaderBarFill: Graphics;
    constructor() {
        super();

        const loaderBarWidth = manager.width * 0.8;

        this.loaderBarFill = new Graphics();
        this.loaderBarFill.beginFill(0x008800, 1);
        this.loaderBarFill.drawRect(0, 0, loaderBarWidth, 50);
        this.loaderBarFill.endFill();
        this.loaderBarFill.scale.x = 0;

        this.loaderBarBoder = new Graphics();
        this.loaderBarBoder.lineStyle(10, 0x0, 1);
        this.loaderBarBoder.drawRect(0, 0, loaderBarWidth, 50);

        this.loaderBar = new Container();
        this.loaderBar.addChild(this.loaderBarFill);
        this.loaderBar.addChild(this.loaderBarBoder);
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
        await Assets.init({ manifest: manifest });

        const bundleIds = manifest.bundles.map((bundle) => bundle.name);

        await Assets.loadBundle(bundleIds, this.downloadProgress.bind(this));
    }

    private downloadProgress(progressRatio: number): void {
        this.loaderBarFill.scale.x = progressRatio;
    }

    private gameLoaded(): void {
        // Change scene to the game scene!
        manager.changeScene(new GameScene());
    }

    public input(key: string): void {}

    public update(framesPassed: number): void {}
}
