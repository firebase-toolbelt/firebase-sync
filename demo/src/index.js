import React, { Component } from 'react';
import { render } from 'react-dom';

/**
 * Setup redux and bind firebaseSync reducer.
 */

import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { firebaseSyncReducer } from '../../src';

const store = combineReducers({
  firebase: firebaseSyncReducer
});

/**
 * Setup firebase
 */

import firebase from 'firebase';
import { getFirebaseSync } from '../../src';

firebase.initializeApp({
  apiKey: "AIzaSyDxU9MrPQDrm9DLZqk9vgA4bYukdVAco9A",
  authDomain: "fir-sync-b8cf1.firebaseapp.com",
  databaseURL: "https://fir-sync-b8cf1.firebaseio.com",
  projectId: "fir-sync-b8cf1"
});

const FirebaseSync = getFirebaseSync(firebase);

/**
 * After setting up.
 * We're ready to use it!
 */

class Demo extends Component {

  state = {
    title: '',
    description: '',
    listItem: '',
    loadingTitle: true,
    loadingDescription: true,
    loadingItems: true
  }

  onChangeStateTitle = (value) => {
    this.setState({ title: value });
  }
  onChangeStateDescription = (value) => {
    this.setState({ description: value });
  }
  onChangeStateListItem = (value) => {
    this.setState({ listItem: value });
  }

  changeTitle = () => {
    firebase.database().ref('title').set(this.state.title);
    this.setState({ title: '' });
  }
  changeDescription = (value) => {
    firebase.database().ref('description').set(this.state.description);
    this.setState({ description: '' });
  }
  pushListItem = (value) => {
    firebase.database().ref('items').push({
      title: this.state.description,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    });
    this.setState({ listItem: '' });
  }

  render() {
    const props = this.props;
    return (
      <Provider store={store}>
        
        <div>
          
          <FirebaseSync
            fetch
            path='title'
            onLoad={() => this.setState({ loadingTitle: false })} />

          <p>database 'title' was only fetched once:</p>
          <p dangerouslySetInnerHTML={props.title} />

          {(this.state.loadingTitle) ? (
            <p>loading…</p>
          ) : (
            <div>
              <input placeholder='...' onChange={this.changeStateTitle} />
              <button onClick={this.changeTitle}>change title</button>
            </div>
          )}

        </div>

        <div style={{ height: 40 }} />

        <div>

          <FirebaseSync
            path='description'
            onLoad={() => this.setState({ loadingDescription: false })} />

          <p>database 'description' is synced with the server:</p>
          <p dangerouslySetInnerHTML={props.description} />

          {(this.state.loadingDescription) ? (
            <p>loading…</p>
          ) : (
            <div>
              <input placeholder='…' onChange={this.changeStateDescription} />
              <button onClick={this.changeDescription}>change description</button>
            </div>
          )}

        </div>

        <div style={{ height: 40 }} />

        <div>
          
          <FirebaseSync
            path='items'
            orderBy='title'
            onLoad={() => this.setState({ loadingItems: false })} />

          <p>database 'items' is a list synced with the server.</p>
          <p>it is ordered by each item value.</p>
          <p>it is fetched as a list and locally ordered using our provided selector.</p>
          <p>(there's a firebase function that continually trims the list to it's last 10 items)</p>
          
          <ul>
            {props.items && props.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          {(this.state.loadingItems) ? (
            <p>loading…</p>
          ) : (
            <div>
              <input placeholder='…' onChange={this.changeStateListItem} />
              <button onClick={this.pushListItem}>add to list</button>
            </div>
          )}

        </div>

      </Provider>
    );
  }
}

const ConnectedDemo = connect(
  (state) => ({
    title: state.firebase.title,
    description: state.firebase.description,
    items: state.firebase.items
  })
)(Demo);

const DemoWrapper = () => (
  <Provider store={store}>
    <ConnectedDemo />
  </Provider>
);

render(<DemoWrapper />, document.querySelector('#demo'))
