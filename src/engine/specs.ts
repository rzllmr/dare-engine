import { Assets } from 'pixi.js';
import { defaultComponents } from 'game/components/registry';

type Specs = Map<string, any>;

export class EntitySpecs {
    private static _data?: Map<string, Specs>;
    private static get data(): Map<string, Specs> {
        if (this._data === undefined) {
            const creatures = Assets.get('entities.creatures');
            const items = Assets.get('entities.items');
            const meta = Assets.get('entities.meta');
            const objects = Assets.get('entities.objects');
            const aggregate = new Map<string, Specs>([...creatures, ...items, ...meta, ...objects]);
            
            this._data = new Map();
            aggregate.forEach((value, key) => {
                this._data?.set(key, value);
            });
        }
        return this._data;
    }

    private static getData(name: string): Specs {
        const entityData = EntitySpecs.data.get(name);
        if (entityData == undefined) throw new Error(`unknown element: ${name}`);

        return entityData;
    }

    private static addInherits(name: string, specs: Specs, likeChain: string[] = []): Specs {
        likeChain.push(name);
        if (!specs.has('like')) return specs;

        let likes = specs.get('like');
        if (typeof likes == 'string') likes = [likes];
        for (const like of likes.reverse()) {
            if (likeChain.includes(like)) {
                console.warn(`cyclic like in "${likeChain.at(-1)}" back to "${like}"`);
                continue;
            }
    
            let likeSpecs = EntitySpecs.getData(like);
            likeSpecs = EntitySpecs.addInherits(like, likeSpecs, likeChain);
            specs = new Map<string, Specs>([...likeSpecs, ...specs])
        }
        specs.delete('like');
        return specs;
    }

    private static addDefaults(specs: Specs): Specs {
        const defaultComps = new Map<string, any>();
        defaultComponents().forEach((name) => defaultComps.set(name, null));
        return new Map<string, any>([...defaultComps, ...specs]);
    }

    public static get(name: string): EntitySpecs {
        let entityData = EntitySpecs.getData(name);
        entityData = EntitySpecs.addInherits(name, entityData);
        entityData = EntitySpecs.addDefaults(entityData);
        return new EntitySpecs(name, entityData);
    }
    
    private readonly _name: string;
    private readonly _components = new Map<string, ComponentSpecs>();

    private constructor(name: string, components: Specs) {
        this._name = name;
        for (const [key, value] of components) {
            this._components.set(key, new ComponentSpecs(value));
        }
    }

    public fillIn(specifics: string): EntitySpecs {
        for (const [key, value] of this._components) {
            value.fillIn(specifics);
        }
        return this;
    }

    public get name(): string {
        return this._name;
    }

    public get components(): Map<string, ComponentSpecs> {
        return this._components;
    }

    public component(name: string): ComponentSpecs | undefined {
        return this._components.get(name);
    }
}

export class ComponentSpecs {
    private readonly specs: Specs;

    constructor(specs: Specs | any = new Map<string, any>()) {
        if (!(specs instanceof Map)) {
            if (specs == '') specs = null;
            specs = new Map<string, any>([
                ['brief', specs]
            ]);
        }
        this.specs = specs;
    }

    public has(name: string): boolean {
        return this.specs.has(name);
    }

    public get<T>(name: string, defaultValue?: T): T {
        return this.specs.get(name) || defaultValue;
    }

    public set<T>(name: string, value: T): void {
        this.specs.set(name, value);
    }

    public fillIn(specifics: string) {
        const list = specifics.split(/,\s*/);
        for (const [key, value] of this.specs) {
            if (!(typeof value == 'string' && value.includes('*'))) continue;

            const pattern = value.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '(.+)');
            const regex = new RegExp(`^${pattern}$`);
            const values: string[] = [];
            for (const specific of list) {
                const match = specific.match(regex)?.[1];
                if (match != null) values.push(match);
            }
            this.specs.set(key, values);
        }
    }

    public assignBrief(spec: string): void {
        const briefValue = this.specs.get('brief');
        if (briefValue != undefined) {
            this.specs.set(spec, briefValue);
        }
    }
}
