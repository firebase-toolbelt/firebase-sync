'use strict';

exports.__esModule = true;
exports.default = getFirebaseReducer;

var _set = require('lodash/fp/set');

var _set2 = _interopRequireDefault(_set);

var _update = require('lodash/fp/update');

var _update2 = _interopRequireDefault(_update);

var _omit = require('lodash/fp/omit');

var _omit2 = _interopRequireDefault(_omit);

var _actions = require('./actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getPath(path) {
  return path.split ? path.split('/') : path;
}

function getFirebaseReducer() {
  var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return function firebaseReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];


    var path = void 0;

    switch (action.type) {

      case _actions.SET:
        path = getPath(action.payload.path);

        return state.setIn ? state.setIn(path, action.payload.item) : (0, _set2.default)(path, action.payload.item)(state);

      case _actions.UPDATE:
        path = getPath(action.payload.path);

        return state.updateIn ? state.updateIn(path, action.payload.fn) : (0, _update2.default)(path, action.payload.fn)(state);

      case _actions.REMOVE:
        path = getPath(action.payload.path);

        if (state.removeIn) {
          return state.removeIn(path);
        } else {
          var parentPath = path.slice(0, -1);
          var pathToOmit = path.slice(-1);
          return (0, _update2.default)(parentPath, function (o) {
            return (0, _omit2.default)(pathToOmit)(o);
          })(state);
        }

      default:
        return state;

    }
  };
}
module.exports = exports['default'];