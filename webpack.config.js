 module.exports = {
   entry: {
     index: './src/main.js',
     'lib/graph-displayer/index': './src/components/graph-displayer/index.js'
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