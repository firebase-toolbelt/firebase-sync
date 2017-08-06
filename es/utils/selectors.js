import { createSelector } from 'reselect';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import values from 'lodash/values';
import isString from 'lodash/isString';

function defaultSortFn(a, b) {
  return !isNaN(a) && !isNaN(b) ? parseFloat(a) - parseFloat(b) : a - b;
}

function getStatePath(basePath, path) {
  return path.map ? [basePath].concat(path) : [basePath].concat(path.split('/'));
}

export function getFirebaseSyncSelector(basePath) {
  return function (options) {

    var path = void 0;
    var orderBy = void 0;

    if (isString(options)) {
      path = options;
    } else {
      path = options.path;
      orderBy = options.orderBy;
    }

    var statePath = getStatePath(basePath, path);

    return createSelector(function (state) {
      return state.getIn ? state.getIn(statePath) : get(state, statePath);
    }, function (possiblyImmData) {

      if (!possiblyImmData) {
        return null;
      }

      var data = possiblyImmData.toJS ? possiblyImmData.toJS() : possiblyImmData;

      if (!!orderBy) {

        var reverse = orderBy.indexOf('-') === 0;

        if (reverse) {
          orderBy = orderBy.slice(1);
        }

        var orderedData = orderBy === '.value' ? values(data).sort(defaultSortFn) : sortBy(values(data), orderBy);

        return reverse ? orderedData.reverse() : orderedData;
      }

      return data;
    });
  };
}