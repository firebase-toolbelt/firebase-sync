import getFirebaseRef from '../firebase/getFirebaseRef';
import { fbSyncItem, fbUnsyncItem, fbSyncList, fbUnsyncList } from '../firebase/read';
import { setItem, removeItem } from '../redux/actions';
import getFirebaseSyncSelector from './selector';
import get from 'lodash/get';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';

/**
 * ============================================================================
 * Common
 * ============================================================================
 */

function parseItem(snap, props) {
  let item = snap.exportVal();

  if (item && !isString(item) && !isNumber(item)) {
    item._key = snap.key;
    item = props.onProcessItem ? props.onProcessItem(item) : item;
    item = props.onPostProcessItem ? props.onPostProcessItem(item) : item;
  }

  return item;
}

function onSnap(snap, props, store, innerState, appendKeyToPath, forceRemove) {

  /**
   * Parse item.
   */
    
  const item = !forceRemove ? parseItem(snap, props) : null;

  /**
   * Parse update path.
   */

  let path = props.localPath ? props.localPath.split('/') : props.path.split('/');
  if (appendKeyToPath) path = path.concat(snap.key);

  /**
   * Update state.
   */
  
  if (item !== null) {
    props.onValue && props.onValue(item);
    props.dispatch(setItem(path, item));
  } else {
    props.onRemove && props.onRemove(snap.key);
    props.dispatch(removeItem(path));
  }

  /**
   * Update state of caller.
   */

  if (innerState && !innerState.loaded) {
    props.onLoad && props.onLoad();
    innerState.loaded = true;
  }

}

/**
 * ============================================================================
 * Items
 * ============================================================================
 */

function syncItem(props, store, selector) {

  /**
   * fbSyncItem returns true if the listener is already active.
   */

  let innerState = {
    loaded: fbSyncItem({
      ...props,
      onSnap: (snap) => onSnap(snap, props, store, innerState)
    })
  };

  /**
   * If already active, trigger onLoad event.
   */

  if (innerState.loaded) {
    props.onLoad && props.onLoad();
  }

}

function unsyncItem(props) {
  return () => fbUnsyncItem(props);
}

function fetchItem(props, store, selector) {

  /**
   * Soft fetch only reaches server if no local item is found.
   */

  if (props.fetch === 'soft') {

    /**
     * We will try to fetch local item on both mutable and immutable states.
     */
    
    const localItem = selector(props)(store.getState());

    if (localItem) {
      props.onLoad && props.onLoad();
      return Promise.resolve(localItem);
    }

  }

  /**
   * If fetch is not set as soft,
   * or if no local item was found,
   * reach server and fetch item.
   * 
   * For increased cached perfomance,
   * we will actually listen to the object path for a few seconds,
   * by doing it this way we will ensure multiple fetches on the same
   * location only triggers a single request.
   * And if an active listener is already active,
   * we will never even have to open an additional connection.
   */

  return new Promise((resolve, reject) => {

    let firstRead = true;

    syncItem({
      ...props,
      onLoad: () => {
        if (firstRead) {
          firstRead = false;
          props.onLoad && props.onLoad();
          resolve(selector(props)(store.getState()));
          setTimeout(() => fbUnsyncItem(props), 10 * 1000);
        }
      }
    });

  });
}
 
/**
 * ============================================================================
 * Lists
 * ============================================================================
 */

function syncList(props, store, selector) {

  /**
   * fbSyncList returns true if the listener is already active.
   */

  let innerState = {
    loaded: fbSyncList({
      ...props,
      onSnapAdded: (snap) => onSnap(snap, props, store, innerState, true),
      onSnapChanged: (snap) => onSnap(snap, props, store, innerState, true),
      onSnapRemoved: (snap) => onSnap(snap, props, store, innerState, true, true)
    })
  };

  /**
   * If already active, trigger onLoad event.
   */

  if (innerState.loaded) {
    props.onLoad && props.onLoad();
    return;
  }

  /**
   * If not trigger the onLoad callback manually after a big timeout.
   * This is necessary because list events does not automatically trigger on empty lists,
   * 
   */

  setTimeout(() => {
    if (!innerState.loaded) {
      props.onLoad && props.onLoad();
      innerState.loaded = true;
    }
  }, 2000);
  
}

function unsyncList(props) {
  return () => fbUnsyncList(props);
}

/**
 * ============================================================================
 * API
 * ============================================================================
 */

const getFirebaseSyncHelpers = (firebase, store) => (_defaultProps = {}) => {
  
  const _ref = getFirebaseRef(firebase);
  const defaultProps = { basePath: 'firebase', ..._defaultProps, _ref, dispatch: store.dispatch };
  const selector = getFirebaseSyncSelector(defaultProps.basePath);

  return {
    fetchItem: (props)  => fetchItem({  ...defaultProps, ...props }, store, selector),
    syncItem: (props)   => syncItem({   ...defaultProps, ...props }, store, selector),
    syncList: (props)   => syncList({   ...defaultProps, ...props }, store, selector),
    unsyncItem: (props) => unsyncItem({ ...defaultProps, ...props }),
    unsyncList: (props) => unsyncList({ ...defaultProps, ...props })
  };

};

export default getFirebaseSyncHelpers;
