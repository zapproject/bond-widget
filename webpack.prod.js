const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  entry: {
    'zap-bond-widget': [path.resolve(__dirname, './src/index.ts')],
  },
  optimization: {
    minimize: true
  },
  output: {
    filename: "[name].js",
    library: 'ZapBondWidget',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  externals: {
    'zapjs': {
      commonjs: 'zapjs',
      commonjs2: 'zapjs',
      amd: 'zapjs',
      root: 'zapjs'
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
  ]
});
