import { createRouter, Route, SubscribeFn, State } from 'router5';
import browserPlugin from 'router5-plugin-browser';
import listenersPlugin from 'router5-plugin-listeners';
import { ValueOf } from './types/types';

export type RouterParams = State['params'];

export type RouterState = State;

export type RouterListener = SubscribeFn;

interface RouteInfo {
  name: AnyPanelId;
  path: string;
  view: AnyViewId;
  params: Record<string, any>;
  isModal?: boolean;
}

export const VIEWS = {
  MAIN: 'main',
} as const;

export type AnyViewId = ValueOf<typeof VIEWS>;

export const PANELS = {
  CONFIG: 'config',
  QR: 'qr',
} as const;

export type AnyPanelId = ValueOf<typeof PANELS>;

interface RouteListEntry extends Route {
  isModal?: boolean;
}

export const routes: RouteListEntry[] = [
  {
    name: PANELS.CONFIG,
    path: '/config',
  },
  {
    name: PANELS.QR,
    path: '/qr',
  },
];

export const panelsOrder: Record<AnyViewId, AnyPanelId[]> = {
  [VIEWS.MAIN]: [PANELS.CONFIG, PANELS.QR],
};

export const findRoute = (routeName: AnyPanelId) => routes.find((route) => route.name === routeName);

export const findView = (routeName: AnyPanelId) => {
  return Object.keys(panelsOrder).find((viewName) => panelsOrder[viewName as AnyViewId].includes(routeName));
};

export const defaultRoute = PANELS.CONFIG;

export const router = createRouter(routes, {
  defaultRoute,
});

router.usePlugin(browserPlugin({ base: '.', useHash: true }));
router.usePlugin(listenersPlugin());

export function getRouteInfo(routeState: RouterState): RouteInfo {
  const panelId = routeState.name as AnyPanelId;

  const route = findRoute(panelId);
  const view = findView(panelId);

  if (!view) {
    throw new Error('invalid view');
  }

  return {
    ...routeState,
    name: panelId,
    path: routeState.path,
    view: view as AnyViewId,
    isModal: !!route?.isModal,
  };
}
