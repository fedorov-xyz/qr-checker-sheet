import React, { ChangeEventHandler, FC, useState } from 'react';
import { PanelHeader, Group, FormLayout, FormItem, Input, Button, File, Radio, Link } from '@vkontakte/vkui';
import { GoogleSpreadsheet, ServiceAccountCredentials } from 'google-spreadsheet';
import { PANELS, router } from '../../router';
import { useAppContext } from '../../AppContext';
import { APP_ID, URL_PROCESSING, UrlProcessingKind } from '../../constants';
import vkBridge from '@vkontakte/vk-bridge';

export const ConfigPanel: FC = () => {
  const { showError, setQRConfig } = useAppContext();

  const [sheetUrl, setSheetUrl] = useState('');
  const [credentials, setCredentials] = useState<ServiceAccountCredentials | null>(null);

  const [urlProcessing, setUrlProcessing] = useState<UrlProcessingKind>(URL_PROCESSING.NO);

  const sheetUrlMatch = sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const sheetId = sheetUrlMatch ? sheetUrlMatch[1] : null;

  const isValid = sheetId !== null && credentials !== null;

  const init = async () => {
    if (!isValid) {
      return;
    }

    const doc = new GoogleSpreadsheet(sheetId);

    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();

    let accessToken = '';
    if (vkBridge.isEmbedded()) {
      const authToken = await vkBridge.send('VKWebAppGetAuthToken', {
        app_id: APP_ID,
        scope: '',
      });

      accessToken = authToken.access_token;
    } else {
      accessToken =
        process.env.NODE_ENV === 'development' ? localStorage.getItem('qr_code_checker:access_token') || '' : '';
    }

    setQRConfig({
      spreadsheet: doc,
      urlProcessing,
      access_token: accessToken,
    });
    router.navigate(PANELS.QR);
  };

  const handleUrlProcessingChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setUrlProcessing(e.target.value as UrlProcessingKind);
  };

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      showError('Не выбран файл');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (data.client_email && data.private_key) {
          setCredentials(data);
        }
      } catch (e) {
        showError('Неверный формат файла. В файле должны быть указаны client_email и private_key.');
      }
    };

    reader.onerror = () => {
      showError('Ошибка чтения файла');
      console.log(reader.error);
    };
  };

  return (
    <>
      <PanelHeader>QR Checker Sheet</PanelHeader>

      <Group>
        <FormLayout>
          <FormItem
            top="Ссылка на таблицу Google Spreadsheet"
            bottom="Таблица должна быть открыта для редактирования по ссылке"
          >
            <Input value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} />
          </FormItem>

          <FormItem top="Файл с авторизацией" bottom={<Link>Показать инструкцию по авторизации</Link>}>
            <File controlSize="m" accept="application/json" onChange={handleFileChange} />
          </FormItem>

          <FormItem top="Варианты обработки ссылок">
            <Radio
              value={URL_PROCESSING.NO}
              checked={urlProcessing === URL_PROCESSING.NO}
              onChange={handleUrlProcessingChange}
            >
              Ничего не делать
            </Radio>
            <Radio
              value={URL_PROCESSING.VK_USERNAME}
              checked={urlProcessing === URL_PROCESSING.VK_USERNAME}
              onChange={handleUrlProcessingChange}
              description={
                <>
                  <code>vk.com/xyz</code> будет прочитано как <code>vk.com/id331639485</code>
                </>
              }
            >
              Разворачивать короткий домен пользователя VK
            </Radio>
          </FormItem>

          <FormItem>
            <Button
              size="m"
              onClick={() => {
                init().catch((e) => {
                  console.error(e);
                  showError(e);
                });
              }}
              disabled={!isValid}
            >
              Перейти к сканированию
            </Button>
          </FormItem>
        </FormLayout>
      </Group>
    </>
  );
};
