import type { ResolverManifest } from 'pixi.js';

export const manifest: ResolverManifest = {
    bundles: [
        {
            name: 'main',
            assets: {
                tiles: './tileset.json',
                'map.test': './maps/test.txt',
                'map.fov': './maps/fov.txt',
                'map.fov.info': './maps/fov.json'
            }
        }
    ]
};
