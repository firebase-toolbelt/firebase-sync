'use strict';

exports.__esModule = true;
exports.getFirebaseSyncSelector = getFirebaseSyncSelector;

var _reselect = require('reselect');

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _sortBy = require('lodash/sortBy');

var _sortBy2 = _interopRequireDefault(_sortBy);

var _values = require('lodash/values');

var _values2 = _interopRequireDefault(_values);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function defaultSortFn(a, b) {
  return !isNaN(a) && !isNaN(b) ? parseFloat(a) - parseFloat(b) : a - b;
}

function getStatePath(basePath, path) {
  return path.map ? [basePath].concat(path) : [basePath].concat(path.split('/'));
}

function getFirebaseSyncSelector(basePath) {
  return function (options) {

    var path = void 0;
    var orderBy = void 0;

    if ((0, _isString2.default)(options)) {
      path = options;
    } else {
      path = options.path;
      orderBy = options.orderBy;
    }

    var statePath = getStatePath(basePath, path);

    return (0, _reselect.createSelector)(function (state) {
      return state.getIn ? state.getIn(statePath) : (0, _get2.default)(state, statePath);
    }, function (possiblyImmData) {

      if (!possiblyImmData) {
        return null;
      }

      var data = possiblyImmData.toJS ? possiblyImmData.toJS() : possiblyImmData;

      if (!!orderBy) {
        return orderBy === '.value' ? (0, _values2.default)(data).sort(defaultSortFn) : (0, _sortBy2.default)((0, _values2.default)(data), orderBy);
      }

      return data;
    });
  };
}