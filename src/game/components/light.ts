import { Point } from 'pixi.js';
import { ComponentSpecs } from 'engine/specs';
import { addComponent } from './registry';
import { SpecdComponent } from './types';

export interface LightSource {
    coord: Point,
    radius: number
}

export class Light extends SpecdComponent {
    constructor(specs: ComponentSpecs) {
        super(specs, 'radius');
    }

    public get radius(): number {
        return this.specs.get('radius', 1);
    }
}

addComponent('light', Light);
