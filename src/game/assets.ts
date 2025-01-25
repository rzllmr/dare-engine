import type { AssetsManifest } from 'pixi.js';

export const manifest: AssetsManifest = {
    bundles: [
        {
            name: 'main',
            assets: {
                'dialog.intro': './content/dialogs/intro.ink',
                'elements.creatures': './content/elements/creatures.yml',
                'elements.items': './content/elements/items.yml',
                'elements.meta': './content/elements/meta.yml',
                'elements.objects': './content/elements/objects.yml',
                'level.demo': './content/levels/demo.yml',
                'level.test': './content/levels/test.yml',
                'sprites.beings': './images/world/beings.json',
                'sprites.objects': './images/world/objects.json',
                'sprites.symbols': './images/world/symbols.json',
                'sprites.tiles': './images/world/tiles.json',
                'version': './version.txt'
            }
        }
    ]
};
