import { createSelector } from 'reselect';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import values from 'lodash/values';
import toPairs from 'lodash/toPairs';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';

function sortFn(orderBy, orderByChild) {
  return (_a, _b) => {
    
    const a = orderByChild ? _a[1][orderBy] : _a[1][orderBy];
    const b = orderByChild ? _b[1][orderBy] : _b[1][orderBy];

    const aIsNumber = !isNaN(a);
    const bIsNumber = !isNaN(b);

    if (aIsNumber && bIsNumber) {
      return parseFloat(a) - parseFloat(b);
    } else if (aIsNumber) {
      return -1;
    } else if (bIsNumber) {
      return 1;
    } else {
      return a - b;
    }

  };
}

function getStatePath(basePath, path) {
  return path.map
    ? [basePath].concat(path)
    : [basePath].concat(path.split('/'));
}

export default function getFirebaseSyncSelector(basePath) {
  return (options) => {

    let path;
    let orderBy;
    let keys;

    if (isString(options) || isArray(options)) {
      path = options;
    } else {
      path = options.path;
      orderBy = options.orderBy;
      keys = options.keys;
    }

    const statePath = getStatePath(basePath, path);

    return createSelector(
      (state) => state.getIn ? state.getIn(statePath) : get(state, statePath),
      (possiblyImmData) => {
        
        if (!possiblyImmData) {
          return null;
        }

        const data = possiblyImmData.toJS
          ? possiblyImmData.toJS()
          : possiblyImmData;

        if (!!orderBy) {

          const reverse = orderBy.indexOf('-') === 0;
          
          if (reverse) {
            orderBy = orderBy.slice(1);
          }

          const entries = toPairs(data);

          let orderedData;
          if (orderBy === '.key') {
            orderedData = entries.sort(sortFn(0));
          } else if (orderBy === '.value') {
            orderedData = entries.sort(sortFn(1));
          } else if (orderBy === '.priority') {
            orderedData = entries.sort(sortFn('_priority', true));
          } else {
            orderedData = entries.sort(sortFn(orderBy, true));
          }

          const dataValue = (keys)
            ? orderedData.map((o) => o[0])
            : orderedData.map((o) => o[1]);
          
          return reverse
            ? dataValue.reverse()
            : dataValue;

        }
        
        return data;

      }
    );
  }
}
