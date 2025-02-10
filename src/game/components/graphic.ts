import { Point, Sprite, Texture } from 'pixi.js';
import { ComponentSpecs, EntitySpecs } from 'engine/specs';
import { TileMap } from 'game/entities/map';
import { Tile } from 'game/entities/tile';
import { addComponent } from './registry';
import { SpecdComponent } from './types';

export class Graphic extends SpecdComponent {
    public onMove = (position: Point): void => {};

    public sprite!: Sprite;
    public image = '';

    public get alpha(): number {
        return this.sprite.alpha;
    }

    public set alpha(alpha: number) {
        this.sprite.alpha = alpha;
    }

    constructor(specs: ComponentSpecs) {
        super(specs, 'idle');
    }

    public override init(): void {
        const spriteName = this.idle + this.suffix();
        this.sprite = this.loadSprite(spriteName);
        this.coord = this.initialCoord;
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

    public get variant(): string[] {
        let variant = this.specs.get('variant', [] as string[]);
        if (typeof variant == 'string') variant = [variant];
        return variant;
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
        for (const variant of this.variant) {
            if (variant.startsWith('random')) {
                suffix += '.' + this.randomSuffix();
            } else if (variant.startsWith('align')) {
                const name = variant.split(':')[1] || this.object.name;
                suffix += '.' + this.alignedSuffix(name);
            } else if (variant.startsWith('openable')) {
                suffix += '.c';
            } else {
                console.warn(`unknown sprite variant: ${variant}`);
            }
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

    public show(): void {
        this.sprite.tint = 0xffffff;
        this.sprite.visible = true;
    }

    public fade(): void {
        if (this.hideInDark) {
            this.sprite.visible = false;
        } else {
            this.sprite.tint = 0x819796;
            this.sprite.visible = true;
        }
    }

    public hide(): void {
        this.sprite.visible = false;
    }

    public get visible(): boolean {
        let visible = this.sprite.visible;
        if (!this.hideInDark) visible &&= this.sprite.tint === 0xffffff;
        return visible;
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
