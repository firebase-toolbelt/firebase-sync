export const SET = 'firebaseSync/SET';
export const UPDATE = 'firebaseSync/UPDATE';
export const REMOVE = 'firebaseSync/REMOVE';

export function setItem(path, item) {
  return { type: SET, payload: { path, item } };
}
export function updateItem(path, fn) {
  return { type: UPDATE, payload: { path, fn } };
}
export function removeItem(path) {
  return { type: REMOVE, payload: { path } };
}
