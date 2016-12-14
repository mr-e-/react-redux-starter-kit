import React, { Component, PropTypes } from 'react'
import { browserHistory, RouterContext } from 'react-router'
import { Provider } from 'react-redux'

class AppContainer extends Component {
  static propTypes = {
    routes : PropTypes.object.isRequired,
    store  : PropTypes.object.isRequired
  }

  shouldComponentUpdate () {
    return false
  }

  render () {
    const { routes, store } = this.props

    return (
      <Provider store={store}>
        <div style={{ height: '100%' }}>
          <RouterContext history={browserHistory} children={routes} />
        </div>
      </Provider>
    )
  }
}

export default AppContainer