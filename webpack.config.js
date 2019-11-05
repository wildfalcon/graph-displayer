const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    path: path.resolve('dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: [
          // These packages are distributed as es2015 modules, therefore they need
          // to be transpiled to es5.
          /node_modules(?:\/|\\)lit-element|lit-html/
        ],
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
}