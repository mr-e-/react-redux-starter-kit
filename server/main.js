const express = require('express')
const debug = require('debug')('app:server')
const webpack = require('webpack')
const webpackClientConfig = require('../config/webpack.client.config')
const webpackServerConfig = require('../config/webpack.server.config.js')
const project = require('../config/project.config')
const compress = require('compression')
const path = require('path')
const spawn = require('child_process').spawn

const app = express()

const serverOutput = webpackServerConfig.output;
const serverFile = path.join(serverOutput.path, serverOutput.filename)
const IS_RUNNING = new RegExp('server is running at', 'g')

// This rewrites all state requests to the root /index.html file
// (ignoring file requests). If you want to implement universal
// rendering, you'll want to remove this middleware.
// app.use(require('connect-history-api-fallback')())

// Apply gzip compression
app.use(compress())

// ------------------------------------
// Apply Webpack HMR Middleware
// ------------------------------------
if (project.env === 'development') {
  const compiler = webpack(webpackClientConfig)
  //const serverCompiler = webpack(webpackServerConfig)

  debug('Enabling webpack dev and HMR middleware')
  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath  : webpackClientConfig.output.publicPath,
    contentBase : project.paths.client(),
    hot         : true,
    quiet       : project.compiler_quiet,
    noInfo      : project.compiler_quiet,
    lazy        : false,
    stats       : project.compiler_stats
  }))
  app.use(require('webpack-hot-middleware')(compiler))


  app.use(express.static(project.paths.public()))


  // var apiServer = require('./server')
  // apiServer(app)
} else {
  debug(
    'Server is being run outside of live development mode, meaning it will ' +
    'only serve the compiled application bundle in ~/dist. Generally you ' +
    'do not need an application server for this and can instead use a web ' +
    'server such as nginx to serve your static files. See the "deployment" ' +
    'section in the README for more information on deployment strategies.'
  )

  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(express.static(project.paths.dist()))
}

function runServer() {
  const pool = []

  return () => new Promise((resolve) => {
    const running = pool.length
    const server = spawn('node', [serverFile])

    while (pool.length) {
      pool[0].kill('SIGTERM')
      pool.pop()
    }

    server.stderr.on('data', process.stderr.write)
    server.stdout.on('data', (data) => {
      const time = new Date().toTimeString().slice(0, 8) // eslint-disable-line no-magic-numbers
      const match = data.toString().match(IS_RUNNING)

      process.stdout.write(`[server.js][${time}]: `)
      process.stdout.write(data)

      if (match && !running) resolve(false)
    })

    pool.push(server)
  })
}

module.exports = app
