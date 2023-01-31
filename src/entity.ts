import { IComponent } from './component';

// eslint-disable-next-line @typescript-eslint/prefer-function-type
type constr<T> = { new (...args: any[]): T };

export abstract class Entity {
    protected _components: IComponent[] = [];

    public get components(): IComponent[] {
        return this._components;
    }

    public addComponent(component: IComponent): void {
        this._components.push(component);
        component.entity = this;
    }

    public getComponent<C extends IComponent>(constr: constr<C>): C {
        for (const component of this._components) {
            if (component instanceof constr) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                return component as C;
            }
        }
        throw new Error(`Component ${constr.name} not found on Entity ${this.constructor.name}`);
    }

    public removeComponent<C extends IComponent>(constr: constr<C>): void {
        let toRemove: IComponent | undefined;
        let index: number | undefined;

        for (let i = 0; i < this._components.length; i++) {
            const component = this._components[i];
            if (component instanceof constr) {
                toRemove = component;
                index = i;
                break;
            }
        }

        if (toRemove !== undefined && index !== undefined) {
            toRemove.entity = null;
            this._components.splice(index, 1);
        }
    }

    public hasComponent<C extends IComponent>(constr: constr<C>): boolean {
        for (const component of this._components) {
            if (component instanceof constr) {
                return true;
            }
        }

        return false;
    }
}
