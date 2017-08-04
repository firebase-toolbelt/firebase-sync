import update from 'lodash/update';

 /**
  * Cache
  * id: { count: 0, off: fn }
  */

let cache = {};

function getCacheId(props) {

  let cacheId = props.localPath || props.path;
  if (props.cacheId) cacheId += `.${props.cacheId}`;
  if (props.orderBy) cacheId += `?orderBy=${props.orderBy}`;
  if (props.startAt) cacheId += `&startAt=${props.startAt}`;
  if (props.endAt) cacheId += `&endAt=${props.endAt}`;
  if (props.equalTo) cacheId += `&equalTo=${props.equalTo}`;
  if (props.limitToLast) cacheId += `&limitToLast=${props.limitToLast}`;
  if (props.limitToFirst) cacheId += `&limitToFirst=${props.limitToFirst}`;

  return cacheId;

}

function cacheAdd(props, fn) {
  const cacheId = getCacheId(props);
  update(cache, [cacheId, 'count'], (x) => x ? x + 1 : 1);
  if (cache[cacheId].count === 1) cache[cacheId].off = fn();
  return cache[cacheId].count > 1;
}

function cacheRemove(props, fn) {
  const cacheId = getCacheId(props);
  update(cache, [cacheId, 'count'], (x) => x ? x - 1 : 0);
  if (!cache[cacheId].count && !!cache[cacheId].off) fn(cache[cacheId].off);
}

/**
 * Creating read reference
 */

function getPathRef(props) {

  let ref = props.ref || props._ref.child(props.path);
  let toString;
  
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

  if (props.startAt) ref = toString
    ? ref.startAt(props.startAt.toString())
    : ref.startAt(props.startAt);

  if (props.endAt) ref = toString
    ? ref.endAt(props.endAt.toString())
    : ref.endAt(props.endAt);

  if (props.equalTo) ref = toString
    ? ref.equalTo(props.equalTo.toString())
    : ref.equalTo(props.equalTo);

  if (props.limitToLast) ref = ref.limitToLast(props.limitToLast);
  if (props.limitToFirst) ref = ref.limitToFirst(props.limitToFirst);

  return ref;

}

export function fbSyncItem(props, onError) {
  return cacheAdd(props, () =>
    getPathRef(props).on('value', props.onSnap, onError));
}

export function fbUnsyncItem(props, onError) {
  cacheRemove(props, (off) =>
    getPathRef(props).off('value', off, onError));
}

export function fbSyncList(props) {
  const ref = getPathRef(props);
  return cacheAdd(props, () => {
    const ref = getPathRef(props);
    return {
      added: ref.on('child_added', props.onSnapAdded),
      changed: ref.on('child_changed', props.onSnapChanged),
      removed: ref.on('child_removed', props.onSnapRemoved)
    };
  });
}

export function fbUnsyncList(props) {
  cacheRemove(props, (off) => {
    const ref = getPathRef(props);
    ref.off('child_added', off.added, props.onError);
    ref.off('child_changed', off.changed, props.onError);
    ref.off('child_removed', off.removed, props.onError);
  });
}
