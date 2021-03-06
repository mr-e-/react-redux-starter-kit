// express.js
import path from 'path'
import http from 'http'
import express from 'express'
import http_proxy from 'http-proxy'

// react-router
import routes from '../src/routes'

// Redux
var createStore = require('../src/store/createStore').default
const store = createStore()

// The server code must export a function
// (`parameters` may contain some miscellaneous library-specific stuff)
export default function(parameters)
{
  // Create HTTP server
  const app = new express()
  const server = new http.Server(app)

  // Serve static files
  //app.use(express.static(path.join(__dirname, '..', 'build/assets')))

  // Proxy API calls to API server
  //const proxy = http_proxy.createProxyServer({ target: 'http://localhost:xxxx' })
  //app.use('/api', (req, res) => proxy.web(req, res))

  // React application rendering
  app.use((req, res) =>
  {
    // Match current URL to the corresponding React page
    // (can use `react-router`, `redux-router`, `react-router-redux`, etc)
    react_router_match_url(routes, req.originalUrl).then((error, result) =>
    {
      if (error)
      {
        res.status(500)
        return res.send('Server error')
      }

      // Render React page

      const page = redux.provide(result, store)

      res.status(200)
      res.send('<!doctype html>' + '\n' + ReactDOM.renderToString(<Html>{page}</Html>))
    })
  })

  // Start the HTTP server
  server.listen()
}
