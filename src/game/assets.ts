import type { ResolverManifest } from 'pixi.js';

export const manifest: ResolverManifest = {
    bundles: [
        {
            name: 'main',
            assets: {
                'version': './version.txt',
                'map.test': './content/maps/test.yml',
                'entities.creatures': './content/entities/creatures.yml',
                'entities.items': './content/entities/items.yml',
                'entities.meta': './content/entities/meta.yml',
                'entities.surroundings': './content/entities/surroundings.yml',
                'dialog.intro': './content/dialogs/intro.ink'
                'sprites.beings': './images/world/beings.json',
                'sprites.objects': './images/world/objects.json',
                'sprites.symbols': './images/world/symbols.json',
                'sprites.tiles': './images/world/tiles.json',
            }
        }
    ]
};
