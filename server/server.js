const express = require('express')
import { RouterContext, match } from 'react-router'
var React = require('react');
const ReactDOM = require('react-dom/server');
import { Provider } from 'react-redux'

var init = function(app) {
  app.set('view engine', 'ejs');
  console.log('doing stuff')

  app.get('/', function ({ url: location }, res) {
    console.log('starting...')

    var createStore = require('../src/store/createStore').default
    const store = createStore()
    const routes = require('../src/modules/index').default(store)

    match({ routes, location }, (err, redirect, renderProps) => {
      if (err)
        res.status(500).send(err.message)
      else if (redirect)
        res.status(302).redirect(redirect.pathname + redirect.search)
      else if (renderProps) {

        //var ReactApp = require('../src/containers/ServerAppContainer').default;

        const provider = (
          <Provider store={store}>
            <RouterContext {...renderProps}/>
          </Provider>
        )

        var html = ReactDOM.renderToString(provider)
        res.render("index", {markup: html})

        //const store = configureStore(reducers)()
        //const html = renderHtml(renderProps, store)

        //res.status(200).send(html)
      } else
        res.status(404).send('404')
    })
  })
}
module.exports = init
