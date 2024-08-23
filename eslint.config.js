import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  eslintConfigPrettier,
  {
    files: ['**/*.js'],
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]
