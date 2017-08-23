// react
import { Component } from 'react';
// redux
import { connect } from 'react-redux';
// utils
import debounce from 'lodash/debounce';
// etc
import propTypes from './FirebaseSync.propTypes';

const getFirebaseSync = (getHelpers) => {
  return (defaultProps = {}) => {

    const _helpers = getHelpers(defaultProps);

    class FirebaseSync extends Component {

      static propTypes = propTypes
      static defaultProps = defaultProps

      lastProps = null

      componentDidMount() { this._setup(this.props); }
      componentWillReceiveProps(nextProps) { this._setup(nextProps); }
      componentWillUnmount() { this._setup(); }

      /**
       * We use debounce so there's no freezing on the UI.
       * Since a lot of this components may be present in a complex container,
       * debouncing redux actions may greatly improve perfomance. 
       */

      _setup = debounce((nextProps) => {
        
        // prevent no-op setup
        if (
          !nextProps || (
            this.lastProps &&
            this.lastProps.path === nextProps.path &&
            this.lastProps.localPath === nextProps.localPath &&
            this.lastProps.fetch === nextProps.fetch &&
            this.lastProps.orderBy === nextProps.orderBy &&
            this.lastProps.ref === nextProps.ref &&
            this.lastProps.cacheId === nextProps.cacheId &&
            this.lastProps.startAt === nextProps.startAt &&
            this.lastProps.endAt === nextProps.endAt &&
            this.lastProps.equalTo === nextProps.equalTo &&
            this.lastProps.limitToFirst === nextProps.limitToFirst &&
            this.lastProps.limitToLast === nextProps.limitToLast
          )
        ) return;

        // bind new props
        if (nextProps) {
          if (nextProps.orderBy) {
            (nextProps.fetch)
              ? _helpers.fetchList(nextProps)
              : _helpers.syncList(nextProps);
          } else {
            (nextProps.fetch)
              ? _helpers.fetchItem(nextProps)
              : _helpers.syncItem(nextProps);
          }
        }

        // unbind last props
        if (this.lastProps && !this.lastProps.fetch) {
          (this.lastProps.orderBy)
            ? _helpers.unsyncList(this.lastProps)
            : _helpers.unsyncItem(this.lastProps);
        }

        // save last props
        this.lastProps = nextProps;

      }, 200)

      /**
       * No need to render.
       */
      
      render() {
        return null;
      }
    }

    return connect()(FirebaseSync);
  };  
};

export default getFirebaseSync;
