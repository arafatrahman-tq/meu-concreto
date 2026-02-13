import withNuxt from './.nuxt/eslint.config.mjs'
import globals from 'globals'

export default withNuxt({
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.browser,
      Bun: 'readonly',
    },
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
})
