import React, { ReactNode, useState } from 'react';
import { ScreenSpinner } from '@vkontakte/vkui';
import { useStateRef } from './useStateRef';

export const useAppPopout = () => {
  const [popout, setPopout, popoutRef] = useStateRef<ReactNode>(null);
  const [screenSpinner, setScreenSpinner] = useState<ReactNode>(null);

  const showPopout = (popout: ReactNode) => {
    setPopout(popout);
  };

  const hidePopout = () => {
    setPopout(null);
  };

  const showScreenSpinner = () => {
    setScreenSpinner(<ScreenSpinner />);
  };

  const hideScreenSpinner = () => {
    setScreenSpinner(null);
  };

  return {
    popout,
    popoutRef,
    screenSpinner,
    showPopout,
    hidePopout,
    showScreenSpinner,
    hideScreenSpinner,
  };
};
