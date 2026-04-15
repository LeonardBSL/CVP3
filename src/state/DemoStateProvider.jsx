import { createContext, useContext, useEffect, useReducer } from 'react';
import { createInitialState, demoReducer, storageKey } from './demoState';

const DemoStateContext = createContext(null);

export function DemoStateProvider({ children, initialState = null }) {
  const [state, dispatch] = useReducer(demoReducer, initialState ?? undefined, () => initialState ?? createInitialState());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        ...state,
        toasts: [],
      }),
    );
  }, [state]);

  return <DemoStateContext.Provider value={{ state, dispatch }}>{children}</DemoStateContext.Provider>;
}

export function useDemoState() {
  const context = useContext(DemoStateContext);
  if (!context) throw new Error('useDemoState must be used within a DemoStateProvider');
  return context;
}
