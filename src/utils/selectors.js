import { createSelector } from 'reselect';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import values from 'lodash/values';

export function getFirebaseListSelector(basePath) {
  return ({ path, orderBy }) => (
    createSelector(
      (state) => get(state, path.map ? [basePath].concat(path) : [basePath].concat(path.split('/'))),
      (data) => {
        if (!data) return null;

        return (orderBy === '.value')
          ? values(data).sort()
          : sortBy(values(data), orderBy);
      }
    )
  );
}
