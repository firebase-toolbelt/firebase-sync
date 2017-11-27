import React, { Component } from 'react'
import { render } from 'react-dom'

import { compose, createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider, connect } from 'react-redux'
import logger from 'redux-logger'

import firebase from 'firebase'
import buildFirebaseSync, { getFirebaseSyncReducer } from '../../src'

import { Map, fromJS } from 'immutable'

import ReactJsonPretty from 'react-json-pretty'

/**
 * Setup redux and bind firebaseSync reducer.
 */

const store = createStore(
  combineReducers({
    appTitle: (state = 'demo') => state,
    firebase: getFirebaseSyncReducer(),
    firebaseImmutable: getFirebaseSyncReducer(Map())
  }),
  applyMiddleware(logger)
)

/**
 * Setup firebase
 */

firebase.initializeApp({
  apiKey: 'AIzaSyDxU9MrPQDrm9DLZqk9vgA4bYukdVAco9A',
  authDomain: 'fir-sync-b8cf1.firebaseapp.com',
  databaseURL: 'https://fir-sync-b8cf1.firebaseio.com',
  projectId: 'fir-sync-b8cf1'
})

/**
 * Setup components
 */

const {
  FirebaseSync,
  firebaseSyncHelpers,
  firebaseSyncConnect
} = buildFirebaseSync({
  firebase: firebase,
  store: store
})

const {
  FirebaseSync: FirebaseSyncImmutable,
  firebaseSyncHelpers: FirebaseSyncHelperImmutable,
  firebaseSyncConnect: firebaseSyncConnectImmutable
} = buildFirebaseSync({
  reducerName: 'firebaseImmutable',
  firebase: firebase,
  store: store,
  defaultProps: {
    postProcessItem: fromJS
  }
})

/**
 * After setting up.
 * We're ready to use it!
 */

class Demo extends Component {
  state = {
    title: '',
    subtitle: null,
    description: '',
    listItem: '',
    loadingTitle: true,
    loadingDescription: true,
    loadingItems: true
  }

  componentDidMount() {
    firebaseSyncHelpers
      .fetchItem({ path: 'subtitle' })
      .then(subtitle => this.setState({ subtitle }))
  }

  changeStateTitle = e => {
    this.setState({ title: e.target.value })
  }
  changeStateDescription = e => {
    this.setState({ description: e.target.value })
  }
  changeStateListItem = e => {
    this.setState({ listItem: e.target.value })
  }

  changeTitle = e => {
    e.preventDefault()
    firebase
      .database()
      .ref('title')
      .set(this.state.title)
    this.setState({ title: '' })
  }
  changeDescription = e => {
    e.preventDefault()
    firebase
      .database()
      .ref('description')
      .set(this.state.description)
    this.setState({ description: '' })
  }
  pushListItem = e => {
    e.preventDefault()
    const value = this.state.listItem
    this.setState({ listItem: '' })
    firebase
      .database()
      .ref('items')
      .push({
        title: value,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      })
  }

  clearStateList = () => {
    firebase
      .database()
      .ref('items')
      .remove()
  }

  render() {
    const props = this.props
    return (
      <div>
        <h1>{props.appTitle}</h1>

        <div style={{ height: 40 }} />

        {!this.state.subtitle ? (
          <div>fetching something programatically…</div>
        ) : (
          <div>
            <p>this has been fetched programatically:</p>
            <p>{this.state.subtitle}</p>
          </div>
        )}

        <div style={{ height: 40 }} />

        <div>
          <FirebaseSync
            fetch
            path="title"
            onValue={() => {
              this.setState({ loadingTitle: false })
            }}
          />

          <p>database 'title' was only fetched once:</p>
          <p dangerouslySetInnerHTML={{ __html: props.title }} />

          {this.state.loadingTitle ? (
            <p>loading…</p>
          ) : (
            <form onSubmit={this.pushListItem}>
              <input
                value={this.state.title}
                placeholder="..."
                onChange={this.changeStateTitle}
              />
              <button type="submit" onClick={this.changeTitle}>
                change title
              </button>
            </form>
          )}
        </div>

        <div style={{ height: 40 }} />

        <div>
          <FirebaseSync
            path="description"
            onValue={() => {
              this.setState({ loadingDescription: false })
            }}
          />

          <p>database 'description' is synced with the server:</p>
          <p dangerouslySetInnerHTML={{ __html: props.description }} />

          {this.state.loadingDescription ? (
            <p>loading…</p>
          ) : (
            <form onSubmit={this.changeDescription}>
              <input
                value={this.state.description}
                placeholder="…"
                onChange={this.changeStateDescription}
              />
              <button type="submit">change description</button>
            </form>
          )}
        </div>

        <div style={{ height: 40 }} />

        <div>
          <FirebaseSync
            path="items"
            orderBy=".key"
            onValue={() => {
              this.setState({ loadingItems: false })
            }}
          />

          <p>database 'items' is a list synced with the server.</p>
          <p>it is ordered by each item value.</p>
          <p>
            it is fetched as a list and locally ordered using our provided
            selector.
          </p>
          <p>
            (there's a firebase function that continually trims the list to it's
            last 10 items)
          </p>

          <ul>
            {props.items &&
              props.items.map((item, i) => (
                <li key={item._key}>{item.title}</li>
              ))}
          </ul>

          {this.state.loadingItems ? (
            <p>loading…</p>
          ) : (
            <form onSubmit={this.pushListItem}>
              <input
                value={this.state.listItem}
                placeholder="…"
                onChange={this.changeStateListItem}
              />
              <button type="submit">add to list</button>
              <button type="button" onClick={this.clearStateList}>
                clear list
              </button>
            </form>
          )}
        </div>

        <div style={{ height: 40 }} />

        <div>
          <p>
            This is our whole state being retrieved by firebaseSync.<br />
            It is saved on our redux store as an immutable object,<br />
            but is used as a normal javascript object when fetched with
            firebaseSyncConnect.
          </p>

          <FirebaseSyncImmutable path="/" />

          {props.immutableDatabase && (
            <ReactJsonPretty json={props.immutableDatabase} />
          )}
        </div>
      </div>
    )
  }
}

const ConnectedDemo = compose(
  firebaseSyncConnect(state => [
    {
      title: 'title',
      description: 'description',
      items: { path: 'items', orderBy: 'title' }
    },
    {
      appTitle: state.appTitle
    }
  ]),
  firebaseSyncConnectImmutable(state => ({
    immutableDatabase: ''
  }))
)(Demo)

const DemoWrapper = () => (
  <Provider store={store}>
    <ConnectedDemo />
  </Provider>
)

render(<DemoWrapper />, document.querySelector('#demo'))
