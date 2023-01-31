import { IComponent } from '../../component';
import { Entity } from '../../entity';
import { Point, Sprite, Texture } from 'pixi.js';
import { TileMap } from '../entities/map';
import properties from '../../properties';

export type PropertyNames = 'map-tiles' | 'reveal-tiles';
properties.register('map-tiles', false, 'revealed tiles stay visible on map');
properties.register('reveal-tiles', false, 'all tiles are revealed on map');

interface Alpha {
    start: number;
    show: number;
    hide: number;
}

export class Graphic implements IComponent {
    public entity!: Entity;

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

        this.registerChanges();

        return this;
    }

    private registerChanges(): void {
        properties.onChange('map-tiles', () => {
            this.alpha.hide = properties.getBool('map-tiles') ? 0.3 : 0.0;
        });
    }

    public show(): void {
        this.sprite.alpha = this.alpha.show;
    }

    public hide(): void {
        this.sprite.alpha = this.alpha.hide;
    }

    public get position(): Point {
        return new Point(Math.round(this.sprite.x / TileMap.tileDim), Math.round(this.sprite.y / TileMap.tileDim));
    }

    public set position(value: Point) {
        this.sprite.x = value.x * TileMap.tileDim;
        this.sprite.y = value.y * TileMap.tileDim;
    }

    private loadSprite(image: string): Sprite {
        const sprite = Sprite.from(Graphic.loadTexture(image));
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
