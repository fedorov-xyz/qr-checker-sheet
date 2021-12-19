import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { SplitCol, SplitLayout, View, Panel, PanelHeader, Alert } from '@vkontakte/vkui';
import vkBridge from '@vkontakte/vk-bridge';
import './styles.css';
import { AnyPanelId, AnyViewId, getRouteInfo, PANELS, panelsOrder, router, VIEWS } from './router';
import { ConfigPanel } from './panels/ConfigPanel/ConfigPanel';
import { QRPanel } from './panels/QRPanel/QRPanel';
import { useAppRouter5 } from './hooks/useAppRouter5';
import { batchedUpdates } from './utils/react';
import * as styles from './App.module.css';
import { useIsMobileLayout } from './utils/adaptivity';
import { AppContextInterface, AppContextProvider, QRConfig, ShowErrorFn } from './AppContext';
import { useAppPopout } from './hooks/useAppPopout';
import { getErrorText } from './utils/errors';

export const App: FC = () => {
  const { initialRouteRef, subscribe: subscribeRouter, canClose } = useAppRouter5({ router });

  const initialRoute = initialRouteRef.current;
  const [initialRouteInfo] = useState(() => getRouteInfo(initialRoute));

  const [, setActiveView] = useState(initialRouteInfo.view);
  const [activePanels, setActivePanels] = useState<Partial<Record<AnyViewId, AnyPanelId>>>(() => {
    return {
      [initialRouteInfo.view]: initialRouteInfo.name,
    };
  });

  const { popout, popoutRef, screenSpinner, showPopout, hidePopout, showScreenSpinner, hideScreenSpinner } =
    useAppPopout();

  const [qrConfig, setQRConfigInternal] = useState<QRConfig | null>(null);

  useEffect(() => {
    subscribeRouter(({ route, previousRoute }) => {
      if (route.meta?.source === 'popstate' && popoutRef.current) {
        hidePopout();
        requestAnimationFrame(() => {
          router.navigate(previousRoute.name, previousRoute.params);
        });
        return;
      }

      const routeInfo = getRouteInfo(route);

      batchedUpdates(() => {
        setActiveView(routeInfo.view);
        setActivePanels((activePanels) => ({
          ...activePanels,
          [routeInfo.view]: routeInfo.name,
        }));
      });
    });
  }, []);

  const closeApp = () => {
    if (vkBridge.isEmbedded()) {
      vkBridge.send('VKWebAppClose');
    } else {
      window.history.back();
    }
  };

  const back = () => {
    if (canClose()) {
      closeApp();
    } else {
      window.history.back();
    }
  };

  const showError: ShowErrorFn = (error) => {
    const errorText = getErrorText(error);

    showPopout(
      <Alert
        actions={[{ autoclose: true, mode: 'default', title: 'Закрыть' }]}
        onClose={hidePopout}
        header="Произошла ошибка"
        text={errorText}
      />,
    );
  };

  const hideError = () => {
    hidePopout();
  };

  const setQRConfig = (config: QRConfig) => {
    setQRConfigInternal(config);
  };

  const appContext = useMemo<AppContextInterface>(() => {
    const context: AppContextInterface = {
      back,
      closeApp,
      showPopout,
      hidePopout,
      showScreenSpinner,
      hideScreenSpinner,
      showError,
      hideError,
      setQRConfig,
    };

    return context;
  }, []);

  const root = (
    <View nav={VIEWS.MAIN} activePanel={activePanels[VIEWS.MAIN] || panelsOrder[VIEWS.MAIN][0]}>
      <Panel id={PANELS.CONFIG}>
        <ConfigPanel />
      </Panel>

      <Panel id={PANELS.QR}>{qrConfig && <QRPanel config={qrConfig} />}</Panel>
    </View>
  );

  const isMobileLayout = useIsMobileLayout();
  let app;
  if (isMobileLayout) {
    app = renderMobileView(root, screenSpinner || popout, null);
  } else {
    app = renderTabletView(root, screenSpinner || popout, null);
  }

  return <AppContextProvider value={appContext}>{app}</AppContextProvider>;
};

function renderMobileView(root: ReactNode, popout: ReactNode, modal: ReactNode) {
  return (
    <SplitLayout className={styles.appLayoutMobile} popout={popout} modal={modal}>
      <SplitCol key="main" width="100%" animate>
        {root}
      </SplitCol>
    </SplitLayout>
  );
}

function renderTabletView(root: ReactNode, popout: ReactNode, modal: ReactNode) {
  return (
    <SplitLayout
      className={styles.appLayoutTablet}
      popout={popout}
      modal={modal}
      header={<PanelHeader shadow separator={false} />}
    >
      <SplitCol key="main" width="100%" maxWidth="800px" spaced>
        {root}
      </SplitCol>
    </SplitLayout>
  );
}
