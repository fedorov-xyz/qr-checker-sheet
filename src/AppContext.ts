import { createContext, ReactNode, useContext } from 'react';
import { AppError } from './types/types';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { UrlProcessingKind } from './constants';

export type ShowErrorFn = (error: AppError) => void;

export interface AppContextInterface {
  back: VoidFunction;
  closeApp: VoidFunction;
  showPopout: (popout: ReactNode) => void;
  hidePopout: VoidFunction;
  showScreenSpinner: VoidFunction;
  hideScreenSpinner: VoidFunction;
  showError: ShowErrorFn;
  hideError: VoidFunction;
  setQRConfig: (config: QRConfig) => void;
}

// @ts-ignore Контекст с обязательными значениями создаётся без них
const AppContext = createContext<AppContextInterface>({});

export const AppContextProvider = AppContext.Provider;

export const useAppContext = () => useContext(AppContext);

export interface QRConfig {
  spreadsheet: GoogleSpreadsheet;
  urlProcessing: UrlProcessingKind;
  access_token: string;
}
