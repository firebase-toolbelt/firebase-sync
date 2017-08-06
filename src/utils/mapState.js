import mapValues from 'lodash/mapValues';
import getFirebaseSyncSelector from './selector';

export default function getFirebaseSyncMapState(basePath) {
  const selector = getFirebaseSyncSelector(basePath);
  return (getStateMap) => {
    return (state, props) => {
      const stateMap = getStateMap(state, props);
      return mapValues(stateMap, (options) => selector(options)(state));
    };
  };
}
