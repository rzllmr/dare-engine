import { Container, Assets, Point } from 'pixi.js';
import { manifest } from '../assets';
import { IScene, manager } from '../../engine/manager';
import { GameScene } from './game';
import { yamlParser } from '../../extensions/yamlParser';
import { htmlParser } from '../../extensions/htmlParser';
import { inkParser } from '../../extensions/inkParser';

export class LoaderScene extends Container implements IScene {
    private readonly splashScreen: HTMLDivElement;
    private readonly loaderBarFill: HTMLDivElement;
    
    constructor() {
        super();

        this.splashScreen = document.querySelector('#splash-screen') as HTMLDivElement;
        this.loaderBarFill = document.querySelector('.progress-bar > div') as HTMLDivElement;

        this.loadAssets().then(() => {
            this.startGame();
        }).catch(() => {});
    }

    private async loadAssets(): Promise<void> {
        Assets.loader.parsers.push(yamlParser);
        Assets.loader.parsers.push(htmlParser);
        Assets.loader.parsers.push(inkParser);

        await Assets.init({ manifest: manifest });

        const bundleIds = manifest.bundles.map((bundle) => bundle.name);

        await Assets.loadBundle(bundleIds, this.showProgress.bind(this));
    }

    private showProgress(progressRatio: number): void {
        this.loaderBarFill.style.width = `${progressRatio * 100}%`;
    }

    private startGame(): void {
        const version: string = Assets.get('version');
        const versionDiv = document.querySelector('#version') as HTMLDivElement;
        versionDiv.textContent = version;

        const gameScene = new GameScene();
        console.log(`${gameScene.gameName} v${version}`);

        this.splashScreen.style.display = 'none';

        manager.changeScene(gameScene);
    }

    public input(position: Point, button?: string): void {}

    public update(framesPassed: number): void {}
}
