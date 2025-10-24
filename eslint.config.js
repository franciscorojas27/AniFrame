export default defineConfig([
    js.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx"],
        plugins: {
            '@typescript-eslint': tsPlugin, 
        },
        extends: [
            'standard',
            'plugin:@typescript-eslint/recommended',
            'plugin:@typescript-eslint/recommended-requiring-type-checking'
        ],
        languageOptions: {
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: process.cwd(),
                ecmaVersion: 2020,
                sourceType: "module",
            },
            globals: {
                Atomics: 'readonly',
                SharedArrayBuffer: 'readonly',
            }
        },
        rules: {
            // sensible TypeScript rule adjustments
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-undef': 'off'
        },
        env: {
            browser: true,
            node: true,
            es2021: true,
        }
    }
]);