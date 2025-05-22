import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  rules: {
    'no-console': 'off',
    'curly': ['error', 'all'],
    'antfu/if-newline': 'off',
    'antfu/top-level-function': 'off',
  },
})
