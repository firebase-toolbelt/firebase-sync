'use strict';

exports.__esModule = true;
exports.unsyncList = exports.syncList = exports.unsyncItem = exports.syncItem = exports.fetchItem = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _read = require('../../firebase/read');

var _actions = require('../../redux/actions');

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _isNumber = require('lodash/isNumber');

var _isNumber2 = _interopRequireDefault(_isNumber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * ============================================================================
 * Common
 * ============================================================================
 */

function parseItem(snap, props) {
  var item = snap.exportVal();

  if (item && !(0, _isString2.default)(item) && !(0, _isNumber2.default)(item)) {
    item._key = snap.key;
    item = props.onProcessItem ? props.onProcessItem(item) : item;
    item = props.onPostProcessItem ? props.onPostProcessItem(item) : item;
  }

  return item;
}

function _onSnap(snap, props, innerState, appendKeyToPath, forceRemove) {

  /**
   * Parse item.
   */

  var item = !forceRemove ? parseItem(snap, props) : null;

  /**
   * Parse update path.
   */

  var path = props.localPath ? props.localPath.split('/') : props.path.split('/');
  if (appendKeyToPath) path = path.concat(snap.key);

  /**
   * Update state.
   */

  if (item !== null) {
    props.onValue && props.onValue(item);
    props.dispatch((0, _actions.setItem)(path, item));
  } else {
    props.onRemove && props.onRemove(snap.key);
    props.dispatch((0, _actions.removeItem)(path));
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

  var curState = getState();
  var path = props.localPath || props.path;
  var statePath = path.split('/');
}

/**
 * ============================================================================
 * Items
 * ============================================================================
 */

function syncItem(props) {

  /**
   * fbSyncItem returns true if the listener is already active.
   */

  var innerState = {
    loaded: (0, _read.fbSyncItem)(_extends({}, props, {
      onSnap: function onSnap(snap) {
        return _onSnap(snap, props, innerState);
      }
    }))
  };

  /**
   * If already active, trigger onLoad event.
   */

  if (innerState.loaded) {
    props.onLoad && props.onLoad();
  }
}

function unsyncItem(props) {
  return function () {
    return (0, _read.fbUnsyncItem)(props);
  };
}

function fetchItem(props, getState) {

  /**
   * Soft fetch only reaches server if no local item is found.
   */

  if (props.fetch === 'soft') {

    /**
     * We will try to fetch local item on both mutable and immutable states.
     */

    var localItem = getLocalPathItem(props, getState);

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

  return new Promise(function (resolve, reject) {

    var firstRead = true;

    syncItem(_extends({}, props, {
      onLoad: function onLoad() {
        if (firstRead) {
          firstRead = false;
          props.onLoad && props.onLoad();
          resolve(getLocalPathItem(props, getState));
          setTimeout(function () {
            return (0, _read.fbUnsyncItem)(props);
          }, 10 * 1000);
        }
      }
    }));
  });
}

/**
 * ============================================================================
 * Lists
 * ============================================================================
 */

function syncList(props) {

  /**
   * fbSyncList returns true if the listener is already active.
   */

  var innerState = {
    loaded: (0, _read.fbSyncList)(_extends({}, props, {
      onSnapAdded: function onSnapAdded(snap) {
        return _onSnap(snap, props, innerState, true);
      },
      onSnapChanged: function onSnapChanged(snap) {
        return _onSnap(snap, props, innerState, true);
      },
      onSnapRemoved: function onSnapRemoved(snap) {
        return _onSnap(snap, props, innerState, true, true);
      }
    }))
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

  setTimeout(function () {
    if (!innerState.loaded) {
      props.onLoad && props.onLoad();
      innerState.loaded = true;
    }
  }, 2000);
}

function unsyncList(props) {
  return function () {
    return (0, _read.fbUnsyncList)(props);
  };
}

/**
 * ============================================================================
 * API
 * ============================================================================
 */

exports.fetchItem = fetchItem;
exports.syncItem = syncItem;
exports.unsyncItem = unsyncItem;
exports.syncList = syncList;
exports.unsyncList = unsyncList;