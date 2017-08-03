import { createSelector } from 'reselect';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import values from 'lodash/values';

export const firebaseListSelector = ({ path, orderBy }) => (
  createSelector(
    (state, props) => get(state, path.map ? path : path.split('/')),
    (data) => {
      if (!data) return null;

      return (orderBy === '.value')
        ? values(data).sort()
        : sortBy(values(data), orderBy);
    }
  )
);
