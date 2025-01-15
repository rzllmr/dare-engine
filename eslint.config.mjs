import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import nodePlugin from "eslint-plugin-n";

export default tseslint.config(
    {
        ignores: [
            "dist/**/*",
            "docs/**/*",
            "node_modules/**/*",
            "src/fast/wasm/**/*",
            "static/**/*",
            "**/*.js",
            "**/*.mjs",
        ]
    },
    {
        files: ['**/*.ts'],

        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommended,
            tseslint.configs.strict,
            tseslint.configs.stylistic,
            nodePlugin.configs["flat/recommended"]
        ],

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.nodeBuiltin
            },

            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json",
            },
        },

        rules: {
            "object-shorthand": "off",
            "@typescript-eslint/consistent-type-definitions": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/prefer-readonly": "error",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-inferrable-types": "off",
            "n/no-missing-import": "off",
            "n/no-unsupported-features/node-builtins": ["error", { "allowExperimental": true }]
        },

        "settings": {
            "node": {
                "version": ">=22.0.0",
            }
        }
    }
);