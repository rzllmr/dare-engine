import { Assets, Container, Point, Sprite, Texture } from 'pixi.js';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Animation } from 'engine/animation';
import { ComponentSpecs, EntitySpecs } from 'engine/specs';
import { TileMap } from 'game/entities/map';
import { Tile } from 'game/entities/tile';
import { addComponent } from './registry';
import { SpecdComponent } from './types';

export class Graphic extends SpecdComponent {
    public onMove = (position: Point): void => {};

    private _container!: Container;
    private _sketch?: Sprite;
    private _sprite!: Sprite;
    private _image?: string;

    constructor(specs: ComponentSpecs) {
        super(specs, 'idle');
    }

    public override init(): void {
        this._container = new Container();
        this._sketch = this.loadSketch(this.image);
        if (this._sketch) this._container.addChild(this._sketch);
        this._sprite = this.loadSprite(this.image);
        this._container.addChild(this._sprite);
        this.coord = this.load('coord', this.initialCoord);
    }

    public get image(): string {
        if (this._image == undefined) {
            this._image = this.load('image', this.idle + this.suffix());
        }
        return this._image as string;
    }

    public set image(image: string) {
        this.save('image', image);
        this._image = image;        
    }

    public get idle(): string {
        return this.specs.get('idle', 'empty');
    }

    public get block(): boolean {
        return this.specs.get('block', false);
    }

    public get initialCoord(): Point {
        return this.specs.get('coord', new Point(0, 0));
    }

    public get variants(): Map<string, any> {
        return this.specs.get('variants', new Map<string, any>());
    }

    public get layer(): 0 | 1 {
        return this.specs.get('ground', false) ? 0 : 1;
    }

    public get sprite(): Container {
        return this._container;
    }

    public static getLayer(name: string): 0 | 1 {
        const specs = EntitySpecs.get(name)?.component('sprite');
        if (specs == undefined) return 1;
        return specs.get('ground', false) ? 0 : 1;
    }

    private suffix(): string {
        let suffix = '';
        const variants = this.variants;
        if (variants.get('random') == true) {
            suffix += '.' + this.randomSuffix();
        }
        if (variants.has('align')) {
            const entityName = variants.get('align');
            suffix += '.' + this.alignedSuffix(entityName);
        }
        if (variants.get('openable') == true) {
            suffix += '.c';
        }
        return suffix;
    }

    private randomSuffix(): string {
        const randomNumber = TileMap.random();
        let suffix = 1;
        if (randomNumber < 0.7) suffix = 1;
        else if (randomNumber < 0.8) suffix = 2;
        else if (randomNumber < 0.9) suffix = 3;
        else suffix = 4;
        return suffix.toString();
    }

    private alignedSuffix(name: string): string {
        const surrounding = Tile.map.surrounding(this.initialCoord);
        let suffix = '';
        if (surrounding[1] == name) suffix += 'n';
        if (surrounding[5] == name) suffix += 'e';
        if (surrounding[7] == name) suffix += 's';
        if (surrounding[3] == name) suffix += 'w';
        if (suffix === '') suffix += 'o';
        return suffix;
    }

    private _hideFirst?: boolean;
    public get hideFirst(): boolean {
        if (this._hideFirst == undefined) {
            const specsValue = this.specs.get('hide-first', false);
            this._hideFirst = this.load('hide-first', specsValue) as boolean;
        }
        return this._hideFirst;
    }

    public set hideFirst(value: boolean) {
        this.save('hide-first', value);
        this._hideFirst = value;
    }

    public get hideEver(): boolean {
        return this.specs.get('hide-ever', false);
    }

    private _unveiled = false;
    public unveil(unveil = true): void {
        this._sprite.visible = unveil;
        this._unveiled = unveil;
    }
    
    public get visible(): boolean {
        return this._unveiled;
    }

    public show(show = true): void {
        if (show) {
            if (!this.hideFirst) {
                this._container.visible = true;
            } else {
                this._container.visible = false;
            }
        } else {
            this._container.visible = false;
        }
    }

    public light(level = 1.0): void {
        if (!this._unveiled) return;

        if (this.hideFirst && level > 0.0) {
            this.hideFirst = false;
            this.show();
        } else if (this.hideEver && level == 0.0) {
            this.hideFirst = true;
            this.show(false);
        }

        this.changeSpriteAlpha(this._sprite.alpha, this.lightGradient(level));
    }

    private lightGradient(value: number): number {
        return Math.pow(value, 1);
    }

    private changeSpriteAlpha(start: number, end: number): void {
        const tween = new Tween({level: start}).to({level: end}).duration(200).easing(Easing.Linear.In);
        tween.onUpdate((current) => { this._sprite.alpha = current.level; });
        new Animation(tween).run();
    }

    public get coord(): Point {
        return TileMap.posToCoord(this._container.position);
    }

    public set coord(value: Point) {
        this._container.position.copyFrom(TileMap.coordToPos(value));
        this.onMove(this._container.position);
    }

    public get position(): Point {
        return this._container.position.clonePoint();
    }

    public set position(value: Point) {
        this._container.position.copyFrom(value);
        this.onMove(this._container.position);
    }

    public afterMove(): void {
        this.save('coord', this.coord);
    }

    private sketchImage(image: string): string {
        return image.replace(/(\.|$)/, '-sketch$1');
    }

    private loadSketch(image: string): Sprite | undefined {
        const sketchImage = this.sketchImage(image);
        if (!Assets.cache.has(sketchImage)) return undefined;
        return this.createSprite(sketchImage);
    }

    private loadSprite(image: string): Sprite {
        const sprite = this.createSprite(image);
        sprite.alpha = 0.0;
        return sprite;
    }

    private createSprite(image: string): Sprite {
        const texture = Graphic.loadTexture(image);
        const sprite = Sprite.from(texture);
        const anchor = new Point(
            sprite.anchor.x / sprite.width,
            sprite.anchor.y / sprite.height
        );
        sprite.anchor.copyFrom(anchor);
        sprite.scale.set(TileMap.scale);
        return sprite;
    }

    public changeSprite(image: string): void {
        this._sprite.texture = Graphic.loadTexture(image);        
        if (this._sketch) {
            this._sketch.texture = Graphic.loadTexture(this.sketchImage(image));
        }
        this.image = image;
    }

    private static readonly textures = new Map<string, Texture>();
    private static loadTexture(image: string): Texture {
        let texture = Graphic.textures.get(image);
        if (texture === undefined) {
            texture = Texture.from(image);
            texture.source.scaleMode = 'nearest';
            Graphic.textures.set(image, texture);
        }
        return texture;
    }
}

addComponent('sprite', Graphic, true);
