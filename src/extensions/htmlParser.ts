import { extensions, ExtensionType, settings, utils } from '@pixi/core';
import { LoaderParserPriority } from '@pixi/assets';
import type { LoaderParser } from '@pixi/assets';

/** simple loader plugin for loading yaml data */
export const htmlParser = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low
    },

    test: function (url: string): boolean {
        return ['.html'].includes(utils.path.extname(url).toLowerCase());
    },

    load: async function <T>(url: string): Promise<T> {
        const response = await settings.ADAPTER.fetch(url);

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
