import { extensions, ExtensionType, settings, utils } from '@pixi/core';
import { LoaderParserPriority } from '@pixi/assets';
import type { LoaderParser } from '@pixi/assets';
import { Compiler } from 'inkjs/compiler/Compiler';

/** simple loader plugin for loading ink data */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const inkParser = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low
    },

    test: function (url: string): boolean {
        return ['.ink'].includes(utils.path.extname(url).toLowerCase());
    },

    load: async function <T>(url: string): Promise<T> {
        const response = await settings.ADAPTER.fetch(url);

        const txt = await response.text();

        let story;
        try {
            story = new Compiler(txt).Compile();
        } catch (e: any) {
            console.error(`Invalid ink file: ${url}\n${(e as Error).message}`);
        }

        return story as T;
    }
} as LoaderParser;

extensions.add(inkParser);
