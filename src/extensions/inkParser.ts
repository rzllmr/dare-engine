import { extensions, ExtensionType, DOMAdapter, path } from 'pixi.js';
import { LoaderParserPriority } from 'pixi.js';
import type { LoaderParser } from 'pixi.js';
import { Compiler } from 'inkjs/compiler/Compiler';

/** simple loader plugin for loading ink data */
export const inkParser = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low
    },

    test: function (url: string): boolean {
        return ['.ink'].includes(path.extname(url).toLowerCase());
    },

    load: async function <T>(url: string): Promise<T> {
        const response = await DOMAdapter.get().fetch(url);

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
