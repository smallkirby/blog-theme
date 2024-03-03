module.exports = {
  trailingComma: 'es5',
  singleQuote: true,
  bracketSpacing: true,
  overrides: [
    {
      files: ['*.html'],
      options: {
        parser: 'go-template',
      },
    },
  ],
  plugins: ['prettier-plugin-go-template'],
};
