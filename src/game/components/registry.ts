import { ComponentSpecs } from "engine/specs";
import { SpecdComponent } from './types';

const _components: Record<string, typeof SpecdComponent> = {};
const _defaultComponents: string[] = [];

export function createComponent(name: string, specs: ComponentSpecs): SpecdComponent | undefined {
    if (!Object.hasOwn(_components, name)) return undefined;
    return new _components[name](specs);
}

export function addComponent(name:string, componentType: typeof SpecdComponent, isDefault = false): void {
    _components[name] = componentType;
    if (isDefault) _defaultComponents.push(name);
}

export function componentNames(): string[] {
    return Object.keys(_components);
}

export function defaultComponents(): string[] {
    return _defaultComponents;
}
