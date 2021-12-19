import { useEffect, useRef, useState } from 'react';
import { State as RouterState, SubscribeFn } from 'router5';
import { Router } from 'router5/dist/types/router';
import vkBridge from '@vkontakte/vk-bridge';
import { noop } from '@vkontakte/vkjs';

interface HookConfigInterface {
  router: Router;
}

/**
 * Хук, упрощающий работу с router5
 *
 * 1) Работу с initialRoute: сохранение первоначального роута,
 *    чтобы была возможность закрыть приложение при навигации на него
 * 2) Отправка событий vk-bridge, включающих/отключающих swipe back из приложения в нативный клиент
 */
export const useAppRouter5 = ({ router }: HookConfigInterface) => {
  const [initialRoute] = useState<RouterState>(() => router.getState());
  const initialRouteRef = useRef<RouterState>(initialRoute);

  const subscribersRef = useRef<SubscribeFn[]>([]);

  const canCloseRef = useRef<boolean>(false);

  const subscribe = (subscriber: SubscribeFn) => {
    const subscribers = subscribersRef.current || [];
    if (!subscribers.includes(subscriber)) {
      subscribers.push(subscriber);
    }
    subscribersRef.current = subscribers;
  };

  const updateCanClose = (canClose: boolean) => {
    canCloseRef.current = canClose;

    let eventName: 'VKWebAppEnableSwipeBack' | 'VKWebAppDisableSwipeBack';
    if (canClose) {
      eventName = 'VKWebAppEnableSwipeBack';
    } else {
      eventName = 'VKWebAppDisableSwipeBack';
    }

    vkBridge.supports(eventName) && vkBridge.send(eventName).catch(noop);
  };

  const canClose = () => {
    return canCloseRef.current;
  };

  useEffect(() => {
    updateCanClose(true);

    const routerListener: SubscribeFn = ({ route, previousRoute }) => {
      // Если переход на второй экран был с replace, то теперь он должен стать initialRoute, чтобы
      // при переходе назад приложение закрывалось
      if (
        route.meta &&
        route.meta.options &&
        route.meta.options.replace &&
        previousRoute &&
        previousRoute.name === initialRouteRef.current?.name
      ) {
        initialRouteRef.current = route;
      }

      const initialRoute = initialRouteRef.current;
      if (initialRoute) {
        const canClose = route.name === initialRoute.name && route.path === initialRoute.path;
        updateCanClose(canClose);
      }

      if (subscribersRef.current) {
        subscribersRef.current.forEach((subscriber) => {
          subscriber({ route, previousRoute });
        });
      }
    };

    router.subscribe(routerListener);
  }, []);

  return {
    initialRouteRef,
    subscribe,
    canClose,
  };
};
