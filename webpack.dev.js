const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    index: [path.resolve(__dirname, './src/demo.ts')],
  },
  devServer: {
    contentBase: path.join(__dirname, 'lib'),
    compress: true,
    port: 8003,
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    }),
  ]
});
