import getFirebaseRef from '../firebase/getFirebaseRef'
import {
  fbSyncItem,
  fbUnsyncItem,
  fbSyncList,
  fbUnsyncList
} from '../firebase/read'
import { setItem, removeItem } from '../redux/actions'
import getFirebaseSyncSelector from './selector'
import get from 'lodash/get'
import isPlainObject from 'lodash/isPlainObject'

/**
 * ============================================================================
 * Config
 * ============================================================================
 */

const QUERY_TIMEOUT = 2000

/**
 * ============================================================================
 * Common
 * ============================================================================
 */

function parseItem(snap, props) {
  let item = snap.exportVal()

  if (isPlainObject(item)) {
    item._key = snap.key
  }

  item = props.onProcessItem ? props.onProcessItem(item) : item
  item = props.onPostProcessItem ? props.onPostProcessItem(item) : item

  return item
}

function parseOnValueItem(item) {
  return item && typeof item === 'object' && item.toJS ? item.toJS() : item
}

function triggerOnValue(item, props, storeOrPrevItem, selector) {
  if (!props.onValue) return

  const prevItem = selector
    ? selector(props)(storeOrPrevItem.getState())
    : storeOrPrevItem

  props.onValue(parseOnValueItem(item), parseOnValueItem(prevItem))
}

function onSnap(snap, props, store, selector, appendKeyToPath, forceRemove) {
  /**
   * Parse item.
   */

  const item = !forceRemove ? parseItem(snap, props) : null

  /**
   * Parse update path.
   */

  let path = props.localPath
    ? props.localPath.split('/')
    : props.path.split('/')
  if (appendKeyToPath) path = path.concat(snap.key)

  /**
   * Trigger side effects
   */

  triggerOnValue(item, props, store, selector)

  /**
   * Update state.
   */

  if (item !== null) {
    props.dispatch(setItem(path, item))
  } else {
    props.dispatch(removeItem(path))
  }
}

/**
 * ============================================================================
 * Items
 * ============================================================================
 */

function syncItem(props, store, selector) {
  // used for forcing `onValue` calls
  // when dealing with cached listeners
  let loaded = false

  fbSyncItem({
    ...props,
    onError: () => (loaded = true),
    onSnap: snap => {
      loaded = true
      onSnap(snap, props, store, selector)
    }
  })

  // if query is not fetched in threshold time,
  // manually call `onValue` with local item
  // as this probably mean the query is cached
  setTimeout(() => {
    if (!loaded && props.onValue) {
      loaded = true
      const localItem = selector(props)(store.getState())
      triggerOnValue(localItem, props, localItem)
    }
  }, QUERY_TIMEOUT)
}

function unsyncItem(props) {
  return () => fbUnsyncItem(props)
}

function fetchItem(props, store, selector) {
  /**
   * Soft fetch only reaches server if no local item is found.
   */

  if (props.fetch === 'soft') {
    const localItem = selector(props)(store.getState())
    if (localItem) {
      triggerOnValue(localItem, props, localItem)
      return Promise.resolve(localItem)
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
    let firstRead = true

    syncItem(
      {
        ...props,
        onValue: item => {
          if (firstRead) {
            firstRead = false
            resolve(item)
            triggerOnValue(item, props, store, selector)
            setTimeout(() => fbUnsyncItem(props), 10 * 1000)
          }
        }
      },
      store,
      selector
    )
  })
}

/**
 * ============================================================================
 * Lists
 * ============================================================================
 */

function syncList(props, store, selector) {
  // used for forcing `onValue` calls
  // when dealing with cached listeners
  let loaded = false

  fbSyncList({
    ...props,
    onError: () => (loaded = true),
    onSnapChanged: snap => onSnap(snap, props, store, selector, true),
    onSnapRemoved: snap => onSnap(snap, props, store, selector, true, true),
    onSnapAdded: snap => {
      loaded = true
      onSnap(snap, props, store, selector, true)
    }
  })

  // if query is not fetched in threshold time,
  // manually call `onValue` with local item
  // as this probably mean the query is cached
  setTimeout(() => {
    if (!loaded && props.onValue) {
      loaded = true
      const localList = selector(props)(store.getState())

      if (localList) {
        localList.forEach(localItem =>
          triggerOnValue(localItem, props, localItem)
        )
      } else {
        triggerOnValue(null, props, null)
      }
    }
  }, QUERY_TIMEOUT)
}

function unsyncList(props) {
  return () => fbUnsyncList(props)
}

/**
 * ============================================================================
 * API
 * ============================================================================
 */

const getFirebaseSyncHelpers = (firebase, store) => (_defaultProps = {}) => {
  const _ref = getFirebaseRef(firebase)
  const defaultProps = {
    basePath: 'firebase',
    ..._defaultProps,
    _ref,
    dispatch: store.dispatch
  }
  const selector = getFirebaseSyncSelector(defaultProps.basePath)

  return {
    fetchItem: props =>
      fetchItem({ ...defaultProps, ...props }, store, selector),
    syncItem: props => syncItem({ ...defaultProps, ...props }, store, selector),
    syncList: props => syncList({ ...defaultProps, ...props }, store, selector),
    unsyncItem: props => unsyncItem({ ...defaultProps, ...props }),
    unsyncList: props => unsyncList({ ...defaultProps, ...props })
  }
}

export default getFirebaseSyncHelpers
