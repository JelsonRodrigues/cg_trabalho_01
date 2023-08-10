const path = require('path');

 module.exports = {
  entry: {
    index: './src/ts/index.js',
    
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './src/dist'),
  },
  module: {
    rules: [{
        test: /\.glsl$/,
        loader: 'webpack-glsl-loader'
      }
    ]
   },
 };