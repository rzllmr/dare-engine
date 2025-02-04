import { Point, Sprite, Texture } from 'pixi.js';
import { ComponentSpecs, SpecdComponent } from 'engine/specs';
import { TileMap } from 'game/entities/map';
import { addComponent } from './registry';

export class Graphic extends SpecdComponent {
    public onMove = (position: Point): void => {};

    public readonly sprite!: Sprite;
    public image = '';

    public get alpha(): number {
        return this.sprite.alpha;
    }

    public set alpha(alpha: number) {
        this.sprite.alpha = alpha;
    }

    constructor(specs: ComponentSpecs) {
        super(specs, 'idle');

        const spriteName = this.idle + this.subtile;
        this.sprite = this.loadSprite(spriteName);
        this.position = this.initialPosition;
    }

    public get idle(): string {
        return this.specs.get('idle', 'empty');
    }

    public get initialPosition(): Point {
        return this.specs.get('position', new Point(0, 0));
    }

    public get subtile(): string {
        const subtile = this.specs.get('subtile', '');
        return subtile == '' ? '' : '.' + subtile;
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

    public get position(): Point {
        return this.sprite.position.multiplyScalar(1 / TileMap.tileDim).round();
    }

    public set position(value: Point) {
        this.sprite.position.copyFrom(value.multiplyScalar(TileMap.tileDim));
        this.onMove(this.sprite.position);
    }

    public get realPos(): Point {
        return this.sprite.position.clonePoint();
    }

    public set realPos(value: Point) {
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
