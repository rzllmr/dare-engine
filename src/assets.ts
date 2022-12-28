import type { ResolverManifest } from "pixi.js";

export const manifest:ResolverManifest = {
    bundles: [
        {
            name : "game",
            assets:
            {
                "tiles" : "./fantasyhextiles_v3.json"
            }
        }
    ]
}
