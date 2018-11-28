const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  performance: {
    hints: false
  },
  entry: {
    index: [path.resolve(__dirname, './src/index.ts')],
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
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new CopyWebpackPlugin([
      {from: 'src/assets', to: 'assets'}
    ]),
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
    ],
  },
}


