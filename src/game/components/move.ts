import { Point } from 'pixi.js';
import { Tween, Easing } from '@tweenjs/tween.js';
import { Animation } from 'engine/animation';
import { ComponentSpecs } from 'engine/specs';
import { Tile } from 'game/entities/tile';
import { Action } from './action';
import { Graphic } from './graphic';
import { addComponent } from './registry';

export class Move extends Action {
    private readonly speed = 200; // in seconds

    constructor(specs: ComponentSpecs) {
        super(specs, 'pass');
    }

    public get pass(): boolean {
        return this.specs.get('pass', false);
    }
    public set pass(value: boolean) {
        this.specs.set('pass', value);
    }

    public override async act(subject: Tile): Promise<void> {
        const subjectPos = subject.getComponent(Graphic).realPos;
        const objectPos =  this.object.getComponent(Graphic).realPos;

        const tween = this.pass ? this.step(subjectPos, objectPos) : this.bounce(subjectPos, objectPos);
        tween.onUpdate((current) => { subject.getComponent(Graphic).realPos = current; });
        await new Animation(tween).run();

        if (this.pass) subject.graphic.sprite.zIndex = this.object.graphic.position.y + 0.5;
    }

    private step(start: Point, end: Point): Tween<any> {
        return new Tween(start).to(end).duration(this.speed).easing(Easing.Sinusoidal.InOut);
    }

    private bounce(start: Point, end: Point): Tween<any> {
        const target = new Point(
            start.x + ( end.x - start.x ) / 3,
            start.y + ( end.y - start.y ) / 3
        );
        return new Tween(start).to(target).duration(this.speed).easing(Easing.Sinusoidal.InOut).repeat(1).yoyo(true);
    }

    public static direction(direction: string): Point {
        switch (direction.toLowerCase()) {
            case 'up':
                return new Point(0, -1);
            case 'down':
                return new Point(0, 1);
            case 'left':
                return new Point(-1, 0);
            case 'right':
                return new Point(1, 0);
            default:
                throw new Error(`not a valid direction: ${direction}`);
        }
    }
}

addComponent('move', Move, true);
