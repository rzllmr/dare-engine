import { Entity } from './entity';
import { ComponentSpecs } from './specs';

export class Component {
    public entity: Entity | null = null;
    public init(): void {}
}

export class SpecdComponent extends Component {
    protected specs: ComponentSpecs;
    constructor(specs = new ComponentSpecs(), briefSpec = 'brief') {
        super();
        this.specs = specs;
        this.specs.assignBrief(briefSpec);
    }
}
