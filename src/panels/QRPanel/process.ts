import { API_VERSION, URL_PROCESSING } from '../../constants';
import vkBridge from '@vkontakte/vk-bridge';
import { QRConfig } from '../../AppContext';
import { UtilsResolveScreenNameResponse } from '@vkontakte/api-schema-typescript';
import { isObject } from '@vkontakte/vkjs';

export async function processValue(value: string, config: QRConfig) {
  let isURL = false;
  try {
    new URL(value);
    isURL = true;
  } catch (e) {}

  if (isURL) {
    value = await processUrl(value, config);
  }

  return value;
}

export async function processUrl(urlString: string, config: QRConfig): Promise<string> {
  const url = new URL(urlString);

  switch (config.urlProcessing) {
    case URL_PROCESSING.NO: {
      return urlString;
    }

    case URL_PROCESSING.VK_USERNAME: {
      try {
        const { response } = (await vkBridge.send('VKWebAppCallAPIMethod', {
          method: 'utils.resolveScreenName',
          params: {
            screen_name: url.pathname.replace('/', ''),
            access_token: config.access_token,
            v: API_VERSION,
          },
        })) as { response: UtilsResolveScreenNameResponse };

        if (isObject(response) && response.type === 'user') {
          return `https://vk.com/id${response.object_id}`;
        }
      } catch (e) {
        console.error(e);
      }

      return urlString;
    }
  }
}
