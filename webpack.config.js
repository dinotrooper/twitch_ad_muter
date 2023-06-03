const path = require('path');

module.exports = {
  mode: 'production', // or 'development' if you prefer
  entry: './main.js', // replace with the entry point of your script
  output: {
    filename: 'bundle.js', // specify the desired output filename
    path: path.resolve(__dirname, 'dist') // specify the output directory
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};