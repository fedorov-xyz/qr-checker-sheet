import { ValueOf } from './types/types';
export { API_VERSION } from '@vkontakte/api-schema-typescript';

export const APP_ID = 8030943;

export const URL_PROCESSING = {
  NO: 'no',
  VK_USERNAME: 'vk_username',
} as const;

export type UrlProcessingKind = ValueOf<typeof URL_PROCESSING>;
