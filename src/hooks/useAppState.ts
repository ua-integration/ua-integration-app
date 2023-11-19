import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

const useAppState = () => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    function handleAppStateChange(nextAppState: AppStateStatus) {
      setAppState(nextAppState);
    }

    const appState = AppState.addEventListener('change', handleAppStateChange);

    return () => appState.remove();
  }, [appState]);

  return { appState };
};

export default useAppState;