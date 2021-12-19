import { useAdaptivity, ViewWidth } from '@vkontakte/vkui';

export function isMobileViewWidth(viewWidth: ViewWidth | undefined): boolean {
  return viewWidth !== undefined && viewWidth <= ViewWidth.MOBILE;
}

export const useIsMobileLayout = () => {
  const { viewWidth } = useAdaptivity();
  return isMobileViewWidth(viewWidth);
};
