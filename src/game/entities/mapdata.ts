import { Point } from 'pixi.js';
import { Scheme } from 'engine/scheme';

interface KeyEntry {
    entity: string;
    details: string;
}

export class MapData {
    private readonly _layout: string;
    private readonly _key: Map<string, KeyEntry>;
    private _dimensions = new Point(0, 0);
    
    public get layout(): string {
        return this._layout;
    }
    
    public get key(): Map<string, KeyEntry> {
        return this._key;
    }
    
    public get dimensions(): Point {
        return this._dimensions;
    }
    
    constructor(yaml: Map<string, any>) {
        const data = new Scheme('Map', yaml);
        const layout = this.parseLayout(data.read('layout'));
        const key = this.parseKey(data.read('key'));
        this._layout = layout;
        this._key = key;
    }
    
    private checkMapDimensions(mapData: string): Point {
        const dimensions = new Point();
        let width = 0;
        for (const char of mapData) {
            if (char === '\n') {
                if (width > dimensions.x) dimensions.x = width;
                dimensions.y++;
                width = 0;
            } else {
                width++;
            }
        }
        return dimensions;
    }
    
    private parseLayout(layoutData: string): string {
        let layout = layoutData.replace(/^\n/, '').replace(/(.) /gm, '$1');
        this._dimensions = this.checkMapDimensions(layout);
        layout = layout.split('\n').map(
            (row) => row.padEnd(this._dimensions.x)
        ).join('\n');
        return layout;
    }
    
    private parseKey(keyData: Map<string, string>): Map<string, KeyEntry> {
        const key = new Map<string, KeyEntry>();
        for (const [char, value] of keyData) {
            const details = value.match(/\s\((.+)\)$/)?.at(1) ?? '';
            const entity = value.replace(` (${details})`, '');
            key.set(char, {entity: entity, details: details});
        }
        return key;
    }
}
