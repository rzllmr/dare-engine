import { PropertyNames as mapProperties } from './game/entities/map';
import { PropertyNames as tileProperties } from './game/entities/tile';

type PropertyName = mapProperties | tileProperties;

class Property<T> {
    public readonly name: PropertyName;
    public readonly comment: string;
    public readonly immutable: boolean;
    public value: T;

    public readonly callbacks = new Array<() => void>();
    public readonly references = new Set<string>();

    constructor(name: PropertyName, value: T, comment: string, immutable: boolean) {
        this.name = name;
        this.comment = comment;
        this.immutable = immutable;
        this.value = value;
    }
}

type TypeName = 'string' | 'number' | 'boolean';

class Properties {
    private static _instance: Properties;
    public static instance(): Properties {
        if (Properties._instance === undefined) {
            Properties._instance = new Properties();
        }
        return Properties._instance;
    }

    private constructor() {}

    private readonly registered = new Map<PropertyName, Property<string> | Property<number> | Property<boolean>>();

    public register(name: PropertyName, value: string, comment: string, immutable?: boolean): void;
    public register(name: PropertyName, value: number, comment: string, immutable?: boolean): void;
    public register(name: PropertyName, value: boolean, comment: string, immutable?: boolean): void;
    public register(
        name: PropertyName,
        value: string | number | boolean,
        comment: string,
        immutable: boolean = false
    ): void {
        if (this.registered.has(name)) throw new Error(`property already registered: ${name}`);

        let property;
        if (typeof value === 'string') property = new Property<string>(name, value, comment, immutable);
        else if (typeof value === 'number') property = new Property<number>(name, value, comment, immutable);
        else property = new Property<boolean>(name, value, comment, immutable);
        this.registered.set(property.name, property);
    }

    public set(name: PropertyName, value: string): void;
    public set(name: PropertyName, value: number): void;
    public set(name: PropertyName, value: boolean): void;
    public set(name: PropertyName, value: string | number | boolean): void {
        const property = this.registered.get(name);
        if (property === undefined) throw new Error(`property not registered: ${name}`);
        if (typeof property.value !== typeof value) throw new Error(`property "${name}" not of type: ${typeof value}`);
        property.value = value;
        console.debug(`property set: ${name} = ${value.toString()}`);
        property.callbacks.forEach((callback) => {
            callback();
        });
    }

    public getString(name: PropertyName): string {
        return this.getOfType(name, 'string') as string;
    }

    public getNumber(name: PropertyName): number {
        return this.getOfType(name, 'number') as number;
    }

    public getBool(name: PropertyName): boolean {
        return this.getOfType(name, 'boolean') as boolean;
    }

    private getOfType(name: PropertyName, type: TypeName): string | number | boolean {
        const property = this.registered.get(name);
        if (property === undefined) throw new Error(`property not registered: ${name}`);
        // eslint-disable-next-line valid-typeof
        if (typeof property.value !== type) throw new Error(`property "${name}" not of type: ${type}`);
        return property.value;
    }

    public onChange(name: PropertyName, callback: () => void): void {
        const property = this.registered.get(name);
        if (property === undefined) throw new Error(`property not registered: ${name}`);
        property.callbacks.push(callback);
    }
}
export const properties = Properties.instance();
