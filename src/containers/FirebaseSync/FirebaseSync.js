// react
import { Component } from 'react';
// redux
import { connect } from 'react-redux';
// utils
import debounce from 'lodash/debounce';
import getFirebaseRef from '../../firebase/getFirebaseRef';
// etc
import propTypes from './FirebaseSync.propTypes';
import {
  fetchItem,
  syncItem,
  unsyncItem,
  syncList,
  unsyncList
 } from './FirebaseSync.utils';

const getFirebaseSync = (firebase, store) => {
  return (defaultProps = {}) => {

    const _ref = getFirebaseRef(firebase);

    class FirebaseSync extends Component {

      static propTypes = propTypes
      static defaultProps = { ...defaultProps, _ref }

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
        ) return;

        // bind new props
        if (nextProps) {
          if (nextProps.orderBy) {
            (nextProps.fetch)
              ? fetchList(nextProps)
              : syncList(nextProps);
          } else {
            (nextProps.fetch)
              ? fetchItem(nextProps, store.getState)
              : syncItem(nextProps);
          }
        }

        // unbind last props
        if (this.lastProps && !this.lastProps.fetch) {
          (this.lastProps.orderBy)
            ? unsyncList(this.lastProps)
            : unsyncItem(this.lastProps);
        }

        // save last props
        this.lastProps = nextProps;

      }, 200)

      /**
       * Utility functions for usage outside react
       */

      fetchItem = (props) => (
        fetchItem({ ...FirebaseSync.defaultProps, ...props }, store.getState)
      )
      syncItem = (props) => {
        syncItem({ ...FirebaseSync.defaultProps, ...props });
      }
      unsyncItem = (props) => {
        unsyncItem({ ...FirebaseSync.defaultProps, ...props });
      }
      syncList = (props) => {
        syncList({ ...FirebaseSync.defaultProps, ...props });
      }
      unsyncList = (props) => {
        unsyncList({ ...FirebaseSync.defaultProps, ...props });
      }

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
