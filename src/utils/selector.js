import { createSelector } from 'reselect';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import values from 'lodash/values';
import isString from 'lodash/isString';

function defaultSortFn(a, b) {
  return (!isNaN(a) && !isNaN(b)) ? parseFloat(a) - parseFloat(b) : a - b;
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

    if (isString(options)) {
      path = options;
    } else {
      path = options.path;
      orderBy = options.orderBy;
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

          let reverse = orderBy.indexOf('-') === 0;
          
          if (reverse) {
            orderBy = orderBy.slice(1);
          }

          let orderedData = (orderBy === '.value')
            ? values(data).sort(defaultSortFn)
            : sortBy(values(data), orderBy);
          
          return reverse
            ? orderedData.reverse()
            : orderedData;

        }
        
        return data;

      }
    );
  }
}
