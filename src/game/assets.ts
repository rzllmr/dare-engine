import type { AssetsManifest } from 'pixi.js';

export const manifest: AssetsManifest = {
    bundles: [
        {
            name: 'main',
            assets: {
                'dialog.intro': './content/dialogs/intro.ink',
                'entities.creatures': './content/entities/creatures.yml',
                'entities.items': './content/entities/items.yml',
                'entities.meta': './content/entities/meta.yml',
                'entities.surroundings': './content/entities/surroundings.yml',
                'map.test': './content/maps/test.yml',
                'sprites.beings': './images/world/beings.json',
                'sprites.objects': './images/world/objects.json',
                'sprites.symbols': './images/world/symbols.json',
                'sprites.tiles': './images/world/tiles.json',
                'version': './version.txt'
            }
        }
    ]
};
