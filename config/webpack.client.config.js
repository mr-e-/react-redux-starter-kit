const argv = require('yargs').argv
const webpack = require('webpack')
const cssnano = require('cssnano')
const merge = require('lodash.merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const project = require('./project.config')
const debug = require('debug')('app:config:webpack')
const webpackConfig = require('./webpack.config.js')

const __DEV__ = project.globals.__DEV__
const __PROD__ = project.globals.__PROD__
const __TEST__ = project.globals.__TEST__

debug('Creating client configuration.')
const webpackClientConfig = merge({}, webpackConfig, {
  name    : 'client',
  target  : 'web',
  devtool : project.compiler_devtool,
  resolve : {
    root       : project.paths.client(),
    extensions : ['', '.js', '.jsx', '.json']
  },
  module : {}
})

// ------------------------------------
// Entry Points
// ------------------------------------
const APP_ENTRY = project.paths.client('main.js')

webpackClientConfig.entry = {
  app : __DEV__
    ? [APP_ENTRY].concat(`webpack-hot-middleware/client?path=${project.compiler_public_path}__webpack_hmr`)
    : [APP_ENTRY],
  vendor : project.compiler_vendors
}

webpackClientConfig.sassLoader = {
  includePaths : project.paths.client('styles')
}

// ------------------------------------
// Bundle Output
// ------------------------------------
webpackClientConfig.output = {
  filename   : `[name].[${project.compiler_hash_type}].js`,
  path       : project.paths.dist(),
  publicPath : project.compiler_public_path
}

// ------------------------------------
// Externals
// ------------------------------------
webpackClientConfig.externals = {}
webpackClientConfig.externals['react/lib/ExecutionEnvironment'] = true
webpackClientConfig.externals['react/lib/ReactContext'] = true
webpackClientConfig.externals['react/addons'] = true

// ------------------------------------
// Plugins
// ------------------------------------
webpackClientConfig.plugins = webpackConfig.plugins.concat([
  new webpack.DefinePlugin({ __BROWSER__: true }),
  new HtmlWebpackPlugin({
    template : project.paths.client('index.html'),
    hash     : false,
    favicon  : project.paths.public('favicon.ico'),
    filename : 'index.html',
    inject   : 'body',
    minify   : {
      collapseWhitespace : true
    }
  })
])

// Ensure that the compiler exits on errors during testing so that
// they do not get skipped and misreported.
if (__TEST__ && !argv.watch) {
  webpackClientConfig.plugins.push(function () {
    this.plugin('done', function (stats) {
      if (stats.compilation.errors.length) {
        // Pretend no assets were generated. This prevents the tests
        // from running making it clear that there were warnings.
        throw new Error(
          stats.compilation.errors.map(err => err.message || err)
        )
      }
    })
  })
}

if (__DEV__) {
  debug('Enabling plugins for live development (HMR, NoErrors).')
  webpackClientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  )
} else if (__PROD__) {
  debug('Enabling plugins for production (OccurenceOrder, Dedupe & UglifyJS).')
  webpackClientConfig.plugins.push(
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress : {
        unused    : true,
        dead_code : true,
        warnings  : false
      }
    })
  )
}

// Don't split bundles during testing, since we only want import one bundle
if (!__TEST__) {
  webpackClientConfig.plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      names : ['vendor']
    })
  )
}

// ------------------------------------
// Finalize Configuration
// ------------------------------------
// when we don't know the public path (we know it only when HMR is enabled [in development]) we
// need to use the extractTextPlugin to fix this issue:
// http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809
if (!__DEV__) {
  debug('Applying ExtractTextPlugin to CSS loaders.')
  webpackClientConfig.module.loaders.filter((loader) =>
    loader.loaders && loader.loaders.find((name) => /css/.test(name.split('?')[0]))
  ).forEach((loader) => {
    const first = loader.loaders[0]
    const rest = loader.loaders.slice(1)
    loader.loader = ExtractTextPlugin.extract(first, rest.join('!'))
    delete loader.loaders
  })

  webpackClientConfig.plugins.push(
    new ExtractTextPlugin('[name].[contenthash].css', {
      allChunks : true
    })
  )
}

module.exports = webpackClientConfig
