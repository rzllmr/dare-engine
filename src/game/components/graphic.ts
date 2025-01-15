import { Component } from '../../engine/component';
import { Point, Sprite, Texture, SCALE_MODES } from 'pixi.js';
import { TileMap } from '../entities/map';

export class Graphic extends Component {
    public onMove = (position: Point): void => {};
    public hideInDark = false;

    public readonly sprite!: Sprite;
    public image = '';

    public get alpha(): number {
        return this.sprite.alpha;
    }

    public set alpha(alpha: number) {
        this.sprite.alpha = alpha;
    }

    constructor(image: string, position: Point) {
        super();

        this.sprite = this.loadSprite(image);
        this.position = position;

        return this;
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
        return new Point(Math.round(this.sprite.x / TileMap.tileDim), Math.round(this.sprite.y / TileMap.tileDim));
    }

    public set position(value: Point) {
        this.sprite.x = value.x * TileMap.tileDim;
        this.sprite.y = value.y * TileMap.tileDim;
        this.onMove(this.sprite.position);
    }

    public get realPos(): Point {
        return new Point(this.sprite.x, this.sprite.y);
    }

    public set realPos(value: Point) {
        this.sprite.x = value.x;
        this.sprite.y = value.y;
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
        sprite.anchor.set(anchor.x, anchor.y);
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
