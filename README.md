# firebase-sync

This lib focus on binding your redux state to your firebase backend.
We do this with a component based approach so that all fetch/sync/unsync operations are done when a component of yours is mounted or unmounted. Helper functions are also provided if you need to access this operations from your code.

We provide a single `FirebaseSync` component that you may use directly or by wrapping it with a predefined setup and exporting it as your own component. We recommended that you use the latter for a more scalable application.

## Table of Contents

[Demo](https://codesandbox.io/s/qKQ9DMMR)

[Setup](#setup)

[Setup with Immutable.js](#setup-with-immutablejs)

[Getting Started](#getting-started)

[Working with lists](#working-with-lists)

[Best practices](#working-with-lists)

## Setup

First you must add the firebase-sync reducer to your app's reducers.

```javascript
  import { combineReducers } from 'redux';
  import { getFirebaseSyncReducer } from 'firebase-react-redux';
  
  combineReducers(
    // your other reducers go here
    firebase: getFirebaseSyncReducer()
  )
```

Then you would normally setup the firebase-sync component and selector.
These components will then be used throughout your app.

```javascript
// ./lib/FirebaseSync.js

import store from './my-redux-store';
import firebase from '/my-initialized-firebase-app';

// the reducer name you have used in your root reducer.
const reducerName = 'firebase';

const FirebaseSync = getFirebaseSync(firebase, store)();
const firebaseListSelector = getFirebaseListSelector(reducerName);

export { FirebaseSync, firebaseListSelector };
```

## Setup with Immutable.js

(If you're not using Immutable.js you can skip to the [Getting Started](#getting-started) guide.

First you must add the firebase-sync reducer to your app's reducers.
You must pass in a `Map` object so we can use it as the reducer's initial state.

```javascript
  import { combineReducers } from 'redux';
  import { getFirebaseSyncReducer } from 'firebase-react-redux';
  import { Map } from 'immutable';
  
  combineReducers(
    // your other reducers go here
    firebase: getFirebaseSyncReducer(Map())
  )
```

Then you would normally setup the firebase-sync component and selector.
These components will then be used throughout your app.
Since you're using Immutable.js you must pass in a `onPostProcessItem` function to the component defaultProps.
This way everything is saved as an Immutable object on your app's state.

```javascript
// ./lib/FirebaseSync.js

import store from './my-redux-store';
import firebase from '/my-initialized-firebase-app';
import { fromJS } from 'immutable';

// the reducer name you have used in your root reducer.
const reducerName = 'firebase';

const FirebaseSync = getFirebaseSync(firebase, store)({ onPostProcessItem: fromJS });
const firebaseListSelector = getFirebaseListSelector(reducerName);

export { FirebaseSync, firebaseListSelector };
```

##  Getting Started

[in progress]


##  Working with lists

[in progress]


##  Best practices

[in progress]
