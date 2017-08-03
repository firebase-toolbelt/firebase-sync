import { fbFetchItem, fbSyncItem, fbUnsyncItem, fbSyncList, fbUnsyncList } from '../../firebase/read';
import { setItem, removeItem } from '../../redux/actions';
import get from 'lodash/get';

/**
 * ============================================================================
 * Common
 * ============================================================================
 */

function createItem(snap, props) {
  return props.onProcessItem
    ? props.onProcessItem(snap.exportVal())
    : snap.exportVal();
}

function onSnap(snap, props, dispatch, innerState, appendKeyToPath) {

  /**
   * Parse item.
   */
    
  let item = snap.exists() ? createItem(snap, props) : snap.val();
  if (props.onPostProcessItem) item = props.onPostProcessItem(item);

  /**
   * Parse update path.
   */

  let path = props.localPath ? props.localPath.split('/') : props.path.split('/');
  if (appendKeyToPath) path = path.concat(snap.key);

  /**
   * Update state.
   */
  
  if (item === null) {
    props.onValue && props.onValue(item);
    dispatch(removeItem(path));
  } else {
    props.onRemove && props.onRemove(snap.key);
    dispatch(setItem(path));
  }

  /**
   * Update state of caller.
   */

  if (innerState && !innerState.loaded) {
    props.onLoad && props.onLoad();
    innerState.loaded = true;
  }

}

function getLocalPathItem(props, getState) {

  const curState = getState();
  const path = props.localPath || props.path;
  const statePath = path.split('/');

}

/**
 * ============================================================================
 * Items
 * ============================================================================
 */

function syncItem(props) {
  return (dispatch, getState) => {

    /**
     * fbSyncItem returns true if the listener is already active.
     */

    let innerState = {
      loaded: fbSyncItem({
        ...props,
        onSnap: (snap) => onSnap(snap, props, dispatch, innerState)
      })
    };

    /**
     * If already active, trigger onLoad event.
     */

    if (innerState.loaded) {
      props.onLoad && props.onLoad();
    }

  };
}

function unsyncItem(props) {
  return () => fbUnsyncItem(props);
}

function fetchItem(props) {
  return (dispatch, getState) => {

    /**
     * Soft fetch only reaches server if no local item is found.
     */

    if (props.fetch === 'soft') {

      /**
       * We will try to fetch local item on both mutable and immutable states.
       */
      
      const localItem = getLocalPathItem(props, getState);

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
            resolve(getLocalPathItem(props, getState));
            setTimeout(() => fbUnsyncItem(fetchProps), 10 * 1000);
          }
        }
      });

    });
  };
}
 
/**
 * ============================================================================
 * Lists
 * ============================================================================
 */

function syncList(props) {
  return (dispatch, getState) => {

    /**
     * fbSyncList returns true if the listener is already active.
     */

    let innerState = {
      loaded: fbSyncList({
        ...props,
        onSnapAdded: (snap) => onSnap(snap, props, dispatch, innerState, true),
        onSnapChanged: (snap) => onSnap(snap, props, dispatch, innerState, true),
        onSnapRemoved: (snap) => onSnap(snap, props, dispatch, innerState, true)
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

  };
}

function unsyncList(props) {
  return () => fbUnsyncList(props);
}

/**
 * ============================================================================
 * API
 * ============================================================================
 */

export {
  fetchItem,
  syncItem,
  unsyncItem,
  syncList,
  unsyncList
};
