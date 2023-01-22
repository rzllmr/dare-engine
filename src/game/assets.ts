import type { ResolverManifest } from "pixi.js";

export const manifest:ResolverManifest = {
    bundles: [
        {
            name : "main",
            assets:
            {
                "tiles" : "./tileset.json",
                "map.test": "./maps/test.txt"
            }
        }
    ]
}
