'use strict';

exports.__esModule = true;
exports.getFirebaseListSelector = getFirebaseListSelector;

var _reselect = require('reselect');

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _sortBy = require('lodash/sortBy');

var _sortBy2 = _interopRequireDefault(_sortBy);

var _values = require('lodash/values');

var _values2 = _interopRequireDefault(_values);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function defaultSortFn(a, b) {
  return !isNaN(a) && !isNaN(b) ? parseFloat(a) - parseFloat(b) : a - b;
}

function getFirebaseListSelector(basePath) {
  return function (_ref) {
    var path = _ref.path,
        orderBy = _ref.orderBy;
    return (0, _reselect.createSelector)(function (state) {
      return (0, _get2.default)(state, path.map ? [basePath].concat(path) : [basePath].concat(path.split('/')));
    }, function (data) {
      if (!data) return null;
      return orderBy === '.value' ? (0, _values2.default)(data).sort(defaultSortFn) : (0, _sortBy2.default)((0, _values2.default)(data), orderBy);
    });
  };
}