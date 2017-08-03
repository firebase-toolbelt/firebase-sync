import set from 'lodash/fp/set';
import update from 'lodash/fp/update';
import omit from 'lodash/fp/omit';
import { SET, UPDATE, REMOVE } from './actions';

function getPath(path) {
  return path.split ? path.split('/') : path;
}

export default function getFirebaseReducer() {
  var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function firebaseReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];


    var path = void 0;

    switch (action.type) {

      case SET:
        path = getPath(action.payload.path);

        return state.setIn ? state.setIn(path, action.payload.item) : set(path, action.payload.item)(state);

      case UPDATE:
        path = getPath(action.payload.path);

        return state.updateIn ? state.updateIn(path, action.payload.fn) : update(path, action.payload.fn)(state);

      case REMOVE:
        path = getPath(action.payload.path);

        if (state.removeIn) {
          return state.removeIn(path);
        } else {
          var parentPath = path.slice(0, -1);
          var pathToOmit = path.slice(-1);
          return update(parentPath, function (o) {
            return omit(pathToOmit)(o);
          })(state);
        }

      default:
        return state;

    }
  };
}