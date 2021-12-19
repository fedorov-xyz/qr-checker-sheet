import { Dispatch, SetStateAction, useCallback, useRef, useState } from 'react';

export function useStateRef<T>(initialState: T | (() => T)) {
  const [state, setState] = useState<T>(initialState);
  const ref = useRef<T>(state);

  const dispatch = useCallback<Dispatch<SetStateAction<T>>>((value) => {
    const nextState: T = value instanceof Function ? value(ref.current) : value;

    ref.current = nextState;
    setState(nextState);
  }, []);

  return [state, dispatch, ref] as const;
}
