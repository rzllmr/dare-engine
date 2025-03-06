import { ColorSource, Point, Sprite, Texture } from 'pixi.js';
import { ComponentSpecs, EntitySpecs } from 'engine/specs';
import { TileMap } from 'game/entities/map';
import { Tile } from 'game/entities/tile';
import { addComponent } from './registry';
import { SpecdComponent } from './types';

export class Graphic extends SpecdComponent {
    public onMove = (position: Point): void => {};

    public sprite!: Sprite;
    public image = '';

    constructor(specs: ComponentSpecs) {
        super(specs, 'idle');
    }

    public override init(): void {
        const spriteName = this.load('image', this.idle + this.suffix());
        this.sprite = this.loadSprite(spriteName);
        this.coord = this.load('coord', this.initialCoord);
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
        const randomNumber = Math.random();
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

    public get hideInDark(): boolean {
        return this.specs.get('hide-in-dark', false);
    }

    private levelToTint(value: number): ColorSource {
        return [
            value * (1 - 0.4) + 0.4, // red
            value * (1 - 0.4) + 0.4, // green
            value * (1 - 0.5) + 0.5  // blue
        ];
    }

    public show(): void {
        this.sprite.visible = true;
    }

    public hide(): void {
        this.sprite.visible = false;
    }

    public light(level = 0.0): void {
        if (this.hideInDark) this.sprite.visible = level > 0.0;
        this.sprite.tint = this.levelToTint(level);
    }

    public get visible(): boolean {
        return this.sprite.visible;
    }

    public get coord(): Point {
        return TileMap.posToCoord(this.sprite.position);
    }

    public set coord(value: Point) {
        this.sprite.position.copyFrom(TileMap.coordToPos(value));
        this.onMove(this.sprite.position);
    }

    public get position(): Point {
        return this.sprite.position.clonePoint();
    }

    public set position(value: Point) {
        this.sprite.position.copyFrom(value);
        this.onMove(this.sprite.position);
    }

    public afterMove(): void {
        this.save('coord', this.coord);
    }

    private loadSprite(image: string): Sprite {
        const texture = Graphic.loadTexture(image);
        texture.source.scaleMode = 'nearest';
        const sprite = Sprite.from(texture);
        this.image = image;
        const anchor = new Point(
            sprite.anchor.x / sprite.width,
            sprite.anchor.y / sprite.height
        );
        sprite.anchor.copyFrom(anchor);
        sprite.visible = false;
        sprite.scale.set(TileMap.scale);
        return sprite;
    }

    public changeSprite(image: string): void {
        this.sprite.texture = Graphic.loadTexture(image);
        this.image = image;
        this.save('image', this.image);
    }

    private static readonly textures = new Map<string, Texture>();
    private static loadTexture(image: string): Texture {
        let texture = Graphic.textures.get(image);
        if (texture === undefined) {
            texture = Texture.from(image);
            Graphic.textures.set(image, texture);
        }
        return texture;
    }
}

addComponent('sprite', Graphic, true);
