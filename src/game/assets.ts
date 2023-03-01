import type { ResolverManifest } from 'pixi.js';

export const manifest: ResolverManifest = {
    bundles: [
        {
            name: 'main',
            assets: {
                version: './version.txt',
                tiles: './tileset.json',
                'map.test': './maps/test.yml',
                'entities.creatures': './entities/creatures.yml',
                'entities.items': './entities/items.yml',
                'entities.meta': './entities/meta.yml',
                'entities.surroundings': './entities/surroundings.yml'
            }
        }
    ]
};
