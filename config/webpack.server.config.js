const webpack = require('webpack')
const merge = require('lodash.merge')
const project = require('./project.config')
const cssnano = require('cssnano')
const webpackConfig = require('./webpack.config.js')

const BASE_CSS_LOADER = 'css?sourceMap&-minimize'

const webpackServerConfig = merge({}, webpackConfig, {
  name    : 'server',
  target  : 'node',
  entry   : './server/server',
  output: {
    publicPath : project.compiler_public_path,
    filename: 'server2.js',
    libraryTarget: 'commonjs2',
    path: project.paths.dist(),
  },
  plugins: [new webpack.DefinePlugin({ __BROWSER__: false })],
  node: {
    __dirname: false,
    __filename: false,
    Buffer: false,
    console: false,
    global: false,
    process: false,
  },
  module: {
    loaders: webpackConfig.module.loaders.concat([{
      test: /\.css$/,
      loaders: [{
        test: /\.scss$/,
        exclude: /node_modules/,
        loaders: [
          'style',
          BASE_CSS_LOADER,
          'postcss',
          'sass?sourceMap'
        ]
      }, {
        test: /\.css$/,
        exclude: /node_modules/,
        loaders: [
          'style',
          BASE_CSS_LOADER,
          'postcss'
        ]
      }],
    }])
  },
  externals: require('webpack-node-externals')(),
})

module.exports = webpackServerConfig
