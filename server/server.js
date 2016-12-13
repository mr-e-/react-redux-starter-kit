const express = require('express')

var React = require('react');
const ReactDOM = require('react-dom/server');

var init = function(app) {
  app.set('view engine', 'ejs');
  console.log('doing stuff')

  app.get('/', function (req, res) {
    console.log('starting...')

    var createStore = require('../src/store/createStore').default
    const store = createStore()
    var ReactApp = require('../src/containers/AppContainer');
    const routes = require('../src/modules/index').default(store)
    var reactHtml = ReactDOM.renderToString(React.createElement(ReactApp, {store, routes}))
    res.render("views/index", {markup: reactHtml})
  })
}

export default init
