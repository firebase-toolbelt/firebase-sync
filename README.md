# firebase-sync

Bind your firebase backedn to your redux state with a dead simple component based approach.
This is extremelly flexible and has been used for more than one year in production apps.

## Table of Contents

[Setup](#setup)

[Setup with Immutable.js](#setup-with-immutablejs)

[Your first synced component](#your-first-synced-component)

[Modifying the stored objects](#modifying-the-stored-objects)

[Working with lists and queries](#working-with-lists)

[Triggering side effects](#triggering-side-effects)

[Local paths](#local-paths)

[Fetching items](#fetching-items)

[Full API](#full-api)

## Setup

First you must add the firebase-sync reducer to your app's reducers.

```javascript
  import { combineReducers } from 'redux';
  import { getFirebaseSyncReducer } from 'firebase-react-redux';
  
  combineReducers({
    // ...your other reducers go here
    firebase: getFirebaseSyncReducer()
  })
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
  
  combineReducers({
    // ...your other reducers go here
    firebase: getFirebaseSyncReducer(Map())
  })
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

##  Your first synced component

We will build a simple user profile component that syncs the user object from your firebase database.
There are two things that you should notice:
- we're using the absence of the user object on our state to show our loading state.
- our database object key is automatically saved on a special `_key` prop. We provide a *lot* more of this utilities.

```javascript
import React from 'react'
import { connect } from 'react-redux'
import get from 'lodash/get'

const User = (props) => (
  <div>
  
    <FirebaseSync path=`users/${props.userId}` />
    
    {(!props.user) ? (
      <p>loading…</p>
    ) : (
      <p>
        <h1>User name: {props.user.name}</h1>
        <p>User id: {props.user._key}</h1>
      </p>
    )}
  
  </div>
)

export default connect((state, props) => ({
  user: get(state, ['users', props.userId])
}))(User)
```

## Modifying the stored objects

Sometimes we want to alter the object we're gonna use inside our components.
It's really simple to do it with firebase-sync as we can process each object before they are saved on our state.
You should also notice how we create a component that encapsulates our FirebaseSync object, this enables a lot of composition possibilities and is considered a good practice.

```javascript
// ./containers/FirebaseSyncUser.js

import React from 'react'
import { FirebaseSync } from '../lib/FirebaseSync'

function processUser(user) {
  return {
    ...user,
    displayName: `${user.firstName} ${user.lastName}`
  };
}

const FirebaseSyncUser = ({ userId }) => (
  <FirebaseSync
    path=`users/${userId}`
    onProcessItem={processUser} />
)

export default FirebaseSyncUser
```

```javascript
// ./containers/User.js

import React from 'react';
import FirebaseSyncUser from '../FirebaseSyncUser'

const User = (props) => (
  <div>
  
    <FirebaseSyncUser userId={props.userId} />
    
    {(props.user) && (
      <div>
        <h1>{user.displayName}</h1>
      </div>
    )}
  
  </div>
)

export default connect(
  (state, props) => ({
    user: get(state, ['user', props.userId])
  })
)(User)
```

##  Working with lists and queries

[in progress]

##  Triggering side effects

[in progress]

##  Local paths

[in progress]

##  Fetching items from code

[in progress]

##  Full API

[in progress]
