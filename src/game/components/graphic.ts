import { IComponent } from '../../engine/component';
import { Entity } from '../../engine/entity';
import { Point, Sprite, Texture, SCALE_MODES } from 'pixi.js';
import { TileMap } from '../entities/map';
import properties from '../../engine/properties';

interface Alpha {
    start: number;
    show: number;
    hide: number;
}

export class Graphic implements IComponent {
    public entity: Entity | null = null;

    public onMove = (position: Point): void => {};

    public readonly sprite!: Sprite;
    private _alpha: Alpha = {
        start: properties.getBool('reveal-tiles') ? 0.3 : 0.0,
        show: 1.0,
        hide: properties.getBool('map-tiles') ? 0.3 : 0.0
    };

    public get alpha(): Alpha {
        return this._alpha;
    }

    public set alpha(alpha: Alpha) {
        this._alpha = alpha;
        this.sprite.alpha = this._alpha.start;
    }

    constructor(image: string, position: Point) {
        this.sprite = this.loadSprite(image);
        this.position = position;

        return this;
    }

    public show(): void {
        this.sprite.alpha = this.alpha.show;
    }

    public hide(): void {
        this.sprite.alpha = this.alpha.hide;
    }

    public get visible(): boolean {
        return this.sprite.alpha === this.alpha.show;
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
        texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
        const sprite = Sprite.from(texture);
        sprite.scale.set(TileMap.scale);
        sprite.anchor.set(0.0);
        sprite.alpha = this.alpha.start;
        return sprite;
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
