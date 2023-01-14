import type { ResolverManifest } from "pixi.js";

export const manifest:ResolverManifest = {
    bundles: [
        {
            name : "main",
            assets:
            {
                "tiles" : "./drjamgo_hex_16x16.json",
                "map.test": "./maps/test.txt"
            }
        }
    ]
}
