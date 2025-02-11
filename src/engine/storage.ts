import { Point } from 'pixi.js';

export type storageTypes = string | number | boolean | Point | any[];

class Storage {
    private static _instance: Storage;
    public static instance(): Storage {
        if (Storage._instance === undefined) {
            Storage._instance = new Storage();
        }
        return Storage._instance;
    }
    
    private readonly _available: boolean = true;
    private readonly storage: globalThis.Storage;
    
    private constructor() {
        if (!this.available('sessionStorage')) {
            console.error('storage not available');
            this._available = false;
        }
        this.storage = sessionStorage;
    }
    
    public available(type: 'localStorage' | 'sessionStorage'): boolean {
        let storage;
        try {
            storage = window[type];
            const x = "__storage_test__";
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            return (
                e instanceof DOMException &&
                e.name === "QuotaExceededError" &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage !== undefined &&
                storage.length !== 0
            );
        }
    }
    
    public clear(): void {
        this.storage.clear();
    }
    
    public save(key: string, value: storageTypes): void {
        if (!this._available) return;
        
        this.storage.setItem(key, this.serialize(value));
    }
    
    public load(key: string, defaultValue: string): string;
    public load(key: string, defaultValue: number): number;
    public load(key: string, defaultValue: boolean): boolean;
    public load(key: string, defaultValue: Point): Point;
    public load(key: string, defaultValue: any[]): any[];
    public load(key: string, defaultValue: storageTypes): storageTypes {
        const json = this.storage.getItem(key);
        if (json == null) return defaultValue;
        
        let value = this.deserialize(json);
        if (defaultValue instanceof Point) value = new Point(value.x, value.y);
        return value;
    }
    
    public serialize<T>(value: T): string {
        return JSON.stringify(value);
    }
    
    public deserialize(value: string): any {
        return JSON.parse(value);
    }
}
export const storage = Storage.instance();
