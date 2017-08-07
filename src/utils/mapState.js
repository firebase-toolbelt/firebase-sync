import mapValues from 'lodash/mapValues';
import getFirebaseSyncSelector from './selector';
import isArray from 'lodash/isArray';

export default function getFirebaseSyncMapState(basePath) {
  const selector = getFirebaseSyncSelector(basePath);
  return (getStateMap) => {
    return (state, props) => {
      
      const stateMap = getStateMap(state, props);

      let result;
      if (isArray(stateMap)) {
        result = mapValues(stateMap[0], (options) => selector(options)(state));
        if (stateMap.length > 1) result = { ...result, ...stateMap[1] };
      } else {
        result = mapValues(stateMap, (options) => selector(options)(state));
      }

      return result;

    };
  };
}
