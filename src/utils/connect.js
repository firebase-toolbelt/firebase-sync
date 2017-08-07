import getFirebaseSyncMapState from './mapState';
import { connect } from 'react-redux';

export default function getFirebaseSyncConnect(basePath) {
  const mapState = getFirebaseSyncMapState(basePath);
  return (getStateMap, mapDispatch, mergeProps, options) => {
    return (WrappedComponent) => {
      return connect(mapState(getStateMap), mapDispatch, mergeProps, options)(WrappedComponent);
    };
  };
}
