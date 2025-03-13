import { Assets } from "pixi.js";

type KnownSettings =
    'game.name' |
    'start.level' |
    'start.spawn';

class Settings {
    private static _instance: Settings;
    public static instance(): Settings {
        if (Settings._instance === undefined) {
            Settings._instance = new Settings();
        }
        return Settings._instance;
    }

    private yaml!: Map<string, any>;

    private get settings(): Map<string, any> {
        if (this.yaml == undefined) {
            this.yaml = Assets.get('settings');
        }
        return this.yaml;
    } 

    public get(setting: KnownSettings): any {
        const keys = setting.split('.');
        let value = this.settings;
        for (const key of keys) {
            if (!(value instanceof Map) || !value.has(key)) {
                throw new Error(`unknwon setting: ${setting}`);
            }
            value = value.get(key);
        }
        return value;
    }
}
export const settings = Settings.instance();
