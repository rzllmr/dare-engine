class Scheme<T> {
    private readonly name: string;
    private readonly map: Map<string, T>;

    constructor(name: string, map: Map<string, T>) {
        this.name = name;
        this.map = map;
    }

    read(key: string, defaultValue?: T): T | undefined {
        if (!this.map.has(key)) {
            if (defaultValue != undefined) return defaultValue;
            
            console.error(`Missing "${key}" in "${this.name}"`);
            return undefined;
        }
        return this.map.get(key);
    }
}

export interface MapData {
    layout: string;
    key: Map<string, string>;
}

export function readMap(yaml: Map<string, any>): MapData {
    const data = new Scheme('Map', yaml);
    return {
        layout: data.read('layout'),
        key: data.read('key')
    };
}

export interface EntityData {
    image: string;
    info: string;
    actions: Map<string, Map<string, any>>;
    pass: boolean
}

export function readEntity(yaml: Map<string, any>): EntityData {
    const data = new Scheme('Entity', yaml);
    return {
        image: data.read('image', 'empty'),
        info: data.read('info', ''),
        actions: data.read('actions', new Map<string, any>()),
        pass: data.read('pass', false)
    };
}
