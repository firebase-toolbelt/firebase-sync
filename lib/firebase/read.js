'use strict';

exports.__esModule = true;
exports.fbSyncItem = fbSyncItem;
exports.fbUnsyncItem = fbUnsyncItem;
exports.fbSyncList = fbSyncList;
exports.fbUnsyncList = fbUnsyncList;

var _update = require('lodash/update');

var _update2 = _interopRequireDefault(_update);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Cache
 * id: { count: 0, off: fn }
 */

var cache = {};

function getCacheId(props) {

  var cacheId = props.localPath || props.path;
  if (props.cacheId) cacheId += '.' + props.cacheId;
  if (props.orderBy) cacheId += '?orderBy=' + props.orderBy;
  if (props.startAt) cacheId += '&startAt=' + props.startAt;
  if (props.endAt) cacheId += '&endAt=' + props.endAt;
  if (props.equalTo) cacheId += '&equalTo=' + props.equalTo;
  if (props.limitToLast) cacheId += '&limitToLast=' + props.limitToLast;
  if (props.limitToFirst) cacheId += '&limitToFirst=' + props.limitToFirst;

  return cacheId;
}

function cacheAdd(props, fn) {
  var cacheId = getCacheId(props);
  (0, _update2.default)(cache, [cacheId, 'count'], function (x) {
    return x ? x + 1 : 1;
  });
  if (cache[cacheId].count === 1) cache[cacheId].off = fn();
  return cache[cacheId].count > 1;
}

function cacheRemove(props, fn) {
  var cacheId = getCacheId(props);
  (0, _update2.default)(cache, [cacheId, 'count'], function (x) {
    return x ? x - 1 : 0;
  });
  if (!cache[cacheId].count && !!cache[cacheId].off) fn(cache[cacheId].off);
}

/**
 * Creating read reference
 */

function getPathRef(props) {

  var ref = props.ref || props._ref.child(props.path);
  var toString = void 0;

  if (props.orderBy) {
    switch (props.orderBy) {
      case '.priority':
        ref = ref.orderByPriority();
        break;
      case '.value':
        ref = ref.orderByValue();
        break;
      case '.key':
        ref = ref.orderByKey();
        toString = true;
        break;
      default:
        ref = ref.orderByChild(props.orderBy);
        break;
    }
  }

  if (props.startAt) ref = toString ? ref.startAt(props.startAt.toString()) : ref.startAt(props.startAt);

  if (props.endAt) ref = toString ? ref.endAt(props.endAt.toString()) : ref.endAt(props.endAt);

  if (props.equalTo) ref = toString ? ref.equalTo(props.equalTo.toString()) : ref.equalTo(props.equalTo);

  if (props.limitToLast) ref = ref.limitToLast(props.limitToLast);
  if (props.limitToFirst) ref = ref.limitToFirst(props.limitToFirst);

  return ref;
}

function fbSyncItem(props, onError) {
  return cacheAdd(props, function () {
    return getPathRef(props).on('value', props.onSnap, onError);
  });
}

function fbUnsyncItem(props, onError) {
  cacheRemove(props, function (off) {
    return getPathRef(props).off('value', off, onError);
  });
}

function fbSyncList(props) {
  var ref = getPathRef(props);
  return cacheAdd(props, function () {
    var ref = getPathRef(props);
    return {
      added: ref.on('child_added', props.onSnapAdded),
      changed: ref.on('child_changed', props.onSnapChanged),
      removed: ref.on('child_removed', props.onSnapRemoved)
    };
  });
}

function fbUnsyncList(props) {
  cacheRemove(props, function (off) {
    var ref = getPathRef(props);
    ref.off('child_added', off.added, props.onError);
    ref.off('child_changed', off.changed, props.onError);
    ref.off('child_removed', off.removed, props.onError);
  });
}