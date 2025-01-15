import { extensions, ExtensionType, DOMAdapter, path } from 'pixi.js';
import { LoaderParserPriority } from 'pixi.js';
import type { LoaderParser } from 'pixi.js';

/** simple loader plugin for loading yaml data */
export const htmlParser = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low
    },

    test: function (url: string): boolean {
        return ['.html'].includes(path.extname(url).toLowerCase());
    },

    load: async function <T>(url: string): Promise<T> {
        const response = await DOMAdapter.get().fetch(url);

        const txt = await response.text();

        let html;
        try {
            html = txt;
        } catch (e: any) {
            console.error(`Invalid html file: ${url}\n${(e as Error).message}`);
        }

        return html as T;
    }
} as LoaderParser;

extensions.add(htmlParser);
