const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/components/graph-displayer/graph-displayer.js',
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
        use: {
          loader: "babel-loader"
        }
       }
     ]
   }
 }