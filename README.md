# Dare
> A humble game engine in TypeScript using PixiJS.

The intention of this project is to experiment with game development for the web and on mobile. Although the most basic tasks should be handled by frameworks like [PixiJS](https://pixijs.com/) for rendering, I want to create the rest of the engine making it run a game on my own. Details about how to make a game with it you can find on its [homepage](https://rzllmr.github.io/pixi-engine/).

## Build instructions

The project requires an installation of [Node.js](https://nodejs.org) including its own package management system [npm](https://www.npmjs.com/) to satisfy all further dependencies. Those modules listed in the _packages.json_ are obtained automatically by executing `npm install` in the working tree root directory. And the following additional commands you can execute afterwards:

`npm start` serves the game to your browser.

`npm run docs` serves the documentation homepage to your browser.

`npm run build` packages everything for deployment in a zip.

`npm test` runs integration tests on the source files.

## File structure

* __design__ _// game content source files_
* __docs__ _// web-page for the engine_
* __src__ _// engine and game source code_
  * __engine__ _// source of the general engine_
  * __extensions__ _// framework extensions_
  * __fast__ _// algorithms optimized for performance_
  * __game__ _// source specific to the game_
  * __templates__ _// templates for html components_
  * __favicon.png__ _// icon for the browser tab_
  * __index.html__ _// document of the one-page app_
  * __main.ts__ _// entry point for the engine_
* __static__ _// files to be served with the game_
  * __content__ _// defining data files_
  * __fonts__ _// fonts used throughout the game_
  * __images__ _// separate images and spritesheets_
  * __styles__ _// css files defining the layout and ui_
  * __version.txt__ _// current game version_
* __test__ _// jest tests for the src files_
* __.prettierrc.json__ _// prettier config_
* __eslint.config.mjs__ _// eslint config_
* __jest.config.js__ _// jest config_
* __LICENSE__ _// main license for source files_
* __package.json__ _// npm config_
* __README.md__ _// this file you're reading_
* __TODO.md__ _// list of tasks at hand_
* __tsconfig.json__ _// typescript config_
* __webpack.config.js__ _// webpack config_

## Third Party

* __Node.js__: JavaScript runtime (https://nodejs.org)

Obtained through Node.js package management (NPM):

* __PixiJS__: HTML5 Creation Engine (https://www.npmjs.com/package/pixi.js)

* __TypeScript__: Language for application-scale JavaScript (https://www.npmjs.com/package/typescript)

* __webpack__: Packs ECMAScript/CommonJs/AMD modules for the browser (https://www.npmjs.com/package/webpack)

* __Jest__: Testing framework (https://www.npmjs.com/package/jest)

* __YAML__: Human-friendly data serialization
  language (https://www.npmjs.com/package/yaml)

* __Handlebars.js__: Extension to the logicless templating language Mustache (https://www.npmjs.com/package/handlebars)

* __inkjs__: Port of inkle's ink, a scripting language for writing interactive narrative (https://www.npmjs.com/package/inkjs)

* __Prettier__: Opinionated code formatter (https://www.npmjs.com/package/prettier)

* __ESLint__: AST-based pattern checker (https://www.npmjs.com/package/eslint)

## Contribution

1. Fork it (<https://github.com/rzllmr/pixi-engine/fork>)
2. Create your feature branch (`git checkout -b feature/example`)
3. Commit your changes (`git commit -am 'Change something'`)
4. Push to the branch (`git push origin feature/example`)
5. Create a new Pull Request

## Licenses

Due to the mix of very different files like code, graphical assets, fonts, content sheets, etc. there are different licenses applied. Those are specified below and provided as documents in the corresponding folders.

<br>

[![License: MIT][mit-license-badge]][mit-license]

Most files with the exemptions below are licensed under [MIT License][mit-license].

<br>

[![License: CC0 1.0][cc0-license-badge]][cc0-license]

All fonts at the following path are not mine and licensed under [Creative Commons Zero 1.0 Universal License][cc0-license].
* *static/fonts/\*\*/\**

<br>

[![License: CC BY-NC-SA 4.0][cc-by-nc-sa-license-badge]][cc-by-nc-sa-license]

All game content and asset files at the following paths and their sub-directories are licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa-license].
* *design/\*\*/\**
* *static/content/\*\*/\**
* *static/images/\*\*/\**

[mit-license]: LICENSE
[mit-license-badge]: https://img.shields.io/badge/License-MIT-yellow.svg

[cc0-license]: https://creativecommons.org/publicdomain/zero/1.0/
[cc0-license-badge]: https://img.shields.io/badge/License-CC0_1.0-lightgrey.svg

[cc-by-nc-sa-license]: https://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-license-badge]: https://img.shields.io/badge/License-CC_BY--NC--SA_4.0-lightgrey.svg
