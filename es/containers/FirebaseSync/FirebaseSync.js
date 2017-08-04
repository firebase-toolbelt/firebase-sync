var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// react
import { Component } from 'react';
// redux
import { connect } from 'react-redux';
// utils
import debounce from 'lodash/debounce';
import getFirebaseRef from '../../firebase/getFirebaseRef';
// etc
import propTypes from './FirebaseSync.propTypes';
import { fetchItem, syncItem, unsyncItem, syncList, unsyncList } from './FirebaseSync.utils';

var getFirebaseSync = function getFirebaseSync(firebase, store) {
  return function () {
    var _class, _temp2;

    var defaultProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


    var _ref = getFirebaseRef(firebase);

    var FirebaseSync = (_temp2 = _class = function (_Component) {
      _inherits(FirebaseSync, _Component);

      function FirebaseSync() {
        var _temp, _this, _ret;

        _classCallCheck(this, FirebaseSync);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.lastProps = null, _this._setup = debounce(function (nextProps) {

          // prevent no-op setup
          if (!nextProps || _this.lastProps && _this.lastProps.path === nextProps.path && _this.lastProps.localPath === nextProps.localPath && _this.lastProps.fetch === nextProps.fetch && _this.lastProps.orderBy === nextProps.orderBy && _this.lastProps.ref === nextProps.ref && _this.lastProps.cacheId === nextProps.cacheId && _this.lastProps.startAt === nextProps.startAt && _this.lastProps.endAt === nextProps.endAt && _this.lastProps.equalTo === nextProps.equalTo && _this.lastProps.limitToFirst === nextProps.limitToFirst && _this.lastProps.limitToLast === nextProps.limitToLast) return;

          // bind new props
          if (nextProps) {
            if (nextProps.orderBy) {
              nextProps.fetch ? fetchList(nextProps) : syncList(nextProps);
            } else {
              nextProps.fetch ? fetchItem(nextProps, store.getState) : syncItem(nextProps);
            }
          }

          // unbind last props
          if (_this.lastProps && !_this.lastProps.fetch) {
            _this.lastProps.orderBy ? unsyncList(_this.lastProps) : unsyncItem(_this.lastProps);
          }

          // save last props
          _this.lastProps = nextProps;
        }, 200), _this.fetchItem = function (props) {
          return fetchItem(_extends({}, FirebaseSync.defaultProps, props), store.getState);
        }, _this.syncItem = function (props) {
          syncItem(_extends({}, FirebaseSync.defaultProps, props));
        }, _this.unsyncItem = function (props) {
          unsyncItem(_extends({}, FirebaseSync.defaultProps, props));
        }, _this.syncList = function (props) {
          syncList(_extends({}, FirebaseSync.defaultProps, props));
        }, _this.unsyncList = function (props) {
          unsyncList(_extends({}, FirebaseSync.defaultProps, props));
        }, _temp), _possibleConstructorReturn(_this, _ret);
      }

      FirebaseSync.prototype.componentDidMount = function componentDidMount() {
        this._setup(this.props);
      };

      FirebaseSync.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        this._setup(nextProps);
      };

      FirebaseSync.prototype.componentWillUnmount = function componentWillUnmount() {
        this._setup();
      };

      /**
       * We use debounce so there's no freezing on the UI.
       * Since a lot of this components may be present in a complex container,
       * debouncing redux actions may greatly improve perfomance. 
       */

      /**
       * Utility functions for usage outside react
       */

      /**
       * No need to render.
       */

      FirebaseSync.prototype.render = function render() {
        return null;
      };

      return FirebaseSync;
    }(Component), _class.defaultProps = _extends({}, defaultProps, { _ref: _ref }), _temp2);
    FirebaseSync.propTypes = process.env.NODE_ENV !== "production" ? propTypes : {};


    return connect()(FirebaseSync);
  };
};

export default getFirebaseSync;