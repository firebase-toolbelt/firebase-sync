'use strict';

exports.__esModule = true;
exports.setItem = setItem;
exports.updateItem = updateItem;
exports.removeItem = removeItem;
var SET = exports.SET = 'firebaseSync/SET';
var UPDATE = exports.UPDATE = 'firebaseSync/UPDATE';
var REMOVE = exports.REMOVE = 'firebaseSync/REMOVE';

function setItem(path, item) {
  return { type: SET, payload: { path: path, item: item } };
}
function updateItem(path, fn) {
  return { type: UPDATE, payload: { path: path, fn: fn } };
}
function removeItem(path) {
  return { type: REMOVE, payload: { path: path } };
}