module.exports = {
  entry: './assets/js/components/algolia.js',
  output: {
    filename: 'algolia.js',
    path: __dirname + '/assets/js/components/bundle',
  },
  mode: 'production',
  optimization: {
    minimize: false, // Hugo minifies JS
  },
  plugins: [],
};
