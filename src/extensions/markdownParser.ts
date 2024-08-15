import { extensions, ExtensionType, settings, utils } from '@pixi/core';
import { LoaderParserPriority } from '@pixi/assets';
import type { LoaderParser } from '@pixi/assets';
import { marked } from 'marked';

/** simple loader plugin for loading yaml data */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const markdownParser = {
    extension: {
        type: ExtensionType.LoadParser,
        priority: LoaderParserPriority.Low
    },

    test: function (url: string): boolean {
        return ['.md'].includes(utils.path.extname(url).toLowerCase());
    },

    load: async function <T>(url: string): Promise<T> {
        const response = await settings.ADAPTER.fetch(url);

        const txt = await response.text();

        let markdown;
        try {
            markdown = marked.parse(txt);
        } catch (e: any) {
            console.error(`Invalid md file: ${url}\n${(e as Error).message}`);
        }

        return markdown as T;
    }
} as LoaderParser;

extensions.add(markdownParser);
