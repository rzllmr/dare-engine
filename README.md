# Pixi Engine
> A simple game engine in TypeScript using PixiJS.

The intention of this project is to experiment with game development for the web. The most basic tasks should be handled by frameworks like PixiJS for rendering. But the rest of the engine making it run a game I want to create on my own. Details about the game I'm going to make with this you can find on its [homepage](https://rzllmr.github.io/pixi-engine/).

## Build instructions

The project requires an installation of [Node.js](https://nodejs.org) including its own package management system to satisfy all further dependencies. Those modules listed in the _packages.json_ are obtained automatically by executing the following line in the working tree root directory:

```sh
npm install
```

Following that you can serve the program through your browser by executing:

```sh
npm start
```

And you can also use the next line to package everything for deployment in a zip:

```sh
npm build
```

## Third Party

* __Node.js__: Node.js JavaScript runtime (https://nodejs.org)

Obtained through Node.js package management (NPM):

* __PixiJS__: The HTML5 Creation Engine (https://www.npmjs.com/package/pixi.js)

* __YAML__: JavaScript parser and stringifier for YAML (https://www.npmjs.com/package/yaml)

* __TypeScript__: TypeScript is a language for application scale JavaScript development (https://www.npmjs.com/package/typescript)

* __Prettier__: Prettier is an opinionated code formatter (https://www.npmjs.com/package/prettier)

* __ESLint__: An AST-based pattern checker for JavaScript (https://www.npmjs.com/package/eslint)

* __eslint-config-prettier__: Turns off all rules that are unnecessary or might conflict with Prettier (https://www.npmjs.com/package/eslint-config-prettier)

* __webpack__: Packs ECMAScript/CommonJs/AMD modules for the browser (https://www.npmjs.com/package/webpack)

## Contribution

1. Fork it (<https://github.com/rzllmr/pixi-engine/fork>)
2. Create your feature branch (`git checkout -b feature/example`)
3. Commit your changes (`git commit -am 'Change something'`)
4. Push to the branch (`git push origin feature/example`)
5. Create a new Pull Request

## License

Licensed under the [MIT license](https://github.com/rzllmr/pixi-engine/blob/main/LICENSE).
