import { extensions, ExtensionType, settings, utils } from '@pixi/core';
import { LoaderParserPriority } from '@pixi/assets';
import type { LoaderParser } from '@pixi/assets';
import YAML from 'yaml';

/** simple loader plugin for loading yaml data */
export const yamlParser = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low
    },

    test: function (url: string): boolean {
        return ['.yml', '.yaml'].includes(utils.path.extname(url).toLowerCase());
    },

    load: async function <T>(url: string): Promise<T> {
        const response = await settings.ADAPTER.fetch(url);

        const txt = await response.text();

        let yaml;
        try {
            yaml = YAML.parse(txt, { mapAsMap: true });
        } catch (e) {
            if (e instanceof YAML.YAMLParseError) {
                console.error(`Invalid yaml file: ${url}\n${e.message}`);
            }
        }

        return yaml as T;
    }
} as LoaderParser;

extensions.add(yamlParser);
