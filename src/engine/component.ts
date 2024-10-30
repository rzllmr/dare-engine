import { Entity } from './entity';

export class Component {
    public entity: Entity | null = null;
    public init(): void {}
}
