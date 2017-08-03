export var SET = 'firebaseSync/SET';
export var UPDATE = 'firebaseSync/UPDATE';
export var REMOVE = 'firebaseSync/REMOVE';

export function setItem(path, item) {
  return { type: SET, payload: { path: path, item: item } };
}
export function updateItem(path, fn) {
  return { type: UPDATE, payload: { path: path, fn: fn } };
}
export function removeItem(path) {
  return { type: REMOVE, payload: { path: path } };
}