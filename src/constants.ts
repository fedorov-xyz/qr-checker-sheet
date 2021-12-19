import { ValueOf } from './types/types';

export const URL_PROCESSING = {
  NO: 'no',
  VK_USERNAME: 'vk_username',
} as const;

export type UrlProcessingKind = ValueOf<typeof URL_PROCESSING>;
