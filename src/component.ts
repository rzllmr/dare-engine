import { Entity } from './entity';

export interface IComponent {
    entity: Entity | null;
}
