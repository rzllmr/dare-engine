export class Scheme<T> {
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
