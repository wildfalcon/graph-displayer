const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve('dist'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        // don't transpile node-modules
        // but do compile lit-element and lit-html
        // https://github.com/Polymer/lit-element/issues/54#issuecomment-546018158
        exclude: /node_modules\/(?!(lit-element|lit-html)\/).*/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
}