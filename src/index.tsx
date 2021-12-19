import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { PANELS, router } from './router';
import { AdaptivityProvider, AppRoot } from '@vkontakte/vkui';

router.start();
router.navigate(PANELS.CONFIG);

ReactDOM.render(
  <AdaptivityProvider>
    <AppRoot noLegacyClasses>
      <App />
    </AppRoot>
  </AdaptivityProvider>,
  document.getElementById('root'),
);
