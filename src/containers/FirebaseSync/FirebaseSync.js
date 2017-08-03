// react
import { Component } from 'react';
// redux
import { connect } from 'react-redux';
// utils
import shallowEqual from 'shallow-equal/objects';
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

const getFirebaseSync = (firebase) => {
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
        if (shallowEqual(this.lastProps, nextProps)) return;

        // bind new props
        if (nextProps) {
          if (nextProps.orderBy) {
            (nextProps.fetch) ? fetchList(nextProps) : syncList(nextProps);
          } else {
            (nextProps.fetch) ? fetchItem(nextProps) : syncItem(nextProps);
          }
        }

        // unbind last props
        if (this.lastProps && !this.lastProps.fetch) {
          (lastProps.orderBy) ? unsyncList(lastProps) : unsyncItem(lastProps);
        }

        // save last props
        this.lastProps = nextProps;

      }, 200)

      /**
       * Utility functions for usage outside react
       */

      fetchItem = (props) => (
        fetchItem({ ...FirebaseSync.defaultProps, ...props })
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
