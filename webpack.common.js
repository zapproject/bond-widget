const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  performance: {
    hints: false
  },
  resolve: {
    extensions: [".js", ".json", ".jsx", ".css", ".ts", ".tsx"],
    mainFiles: ['index'],
    alias: {
      'Chart': require.resolve('chart.js'),
      'BigNumber': require.resolve('bignumber.js'),
    }
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
  ],
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
    chunkFilename: '[name].js',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
    ],
  },
}


