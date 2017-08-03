'use strict';

exports.__esModule = true;

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = {

  /**
   * The path that will be synced or fetched on the database
   */

  path: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.array]).isRequired,

  /**
   * The path that will storage the fetched data
   * if not defined the remote path will be used
   */

  localPath: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.array]),

  /**
   * When fetch is defined,
   * no sync operation will occur
   * instead, the item will be fetched only once from the database
   * no fetch will occur if fetch is set to 'soft' and
   * an item is already set on the local path.
   */

  fetch: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.bool]),

  /**
   * When orderBy is defined,
   * the result is treated as a list
   * and we will bind listeners to child changes.
   * This should be used on large datasets.
   */

  orderBy: _propTypes2.default.string,

  /**
   * A custom ref maybe passed for more complex queries.
   * This will bypass all previous props.
   * The result will still be saved on the localPath | path prop.
   */

  ref: _propTypes2.default.func,

  /**
   * called whenever an item is added or changed
   * the function is called with the item that is on storage
   */

  onValue: _propTypes2.default.func,

  /**
   * called whenever an item is removed
   */

  onRemove: _propTypes2.default.func,

  /**
   * Called before saving the item to storage
   * you must return the item that will be saved
   * if null is return the item is removed from the storage
   */

  onProcessItem: _propTypes2.default.func,

  /**
   * Called after processing the item.
   * This can be set on the defaultProps
   * so items are converted to immutable objects
   * before saving them to the storage.
   */

  onPostProcessItem: _propTypes2.default.func

};

exports.default = propTypes;
module.exports = exports['default'];