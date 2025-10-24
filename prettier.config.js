// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  singleQuote: true,

  tabWidth: 4,
  trailingComma: 'es5',

  arrowParens: 'avoid',
  jsxBracketSameLine: true,
}

export default config
