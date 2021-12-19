import React, { ChangeEventHandler, FC, useState } from 'react';
import { PanelHeader, Group, FormLayout, FormItem, Input, Button, File } from '@vkontakte/vkui';
import { GoogleSpreadsheet, ServiceAccountCredentials } from 'google-spreadsheet';
import { PANELS, router } from '../../router';
import { useAppContext } from '../../AppContext';

interface Props {
  setSpreadsheet: (sheet: GoogleSpreadsheet) => void;
}

export const ConfigPanel: FC<Props> = ({ setSpreadsheet }) => {
  const { showError } = useAppContext();

  const [sheetUrl, setSheetUrl] = useState('');
  const [credentials, setCredentials] = useState<ServiceAccountCredentials | null>(null);

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

    setSpreadsheet(doc);
    router.navigate(PANELS.QR);
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
      <PanelHeader>Начало работы</PanelHeader>

      <Group>
        <FormLayout>
          <FormItem top="Ссылка на таблицу Google Spreadsheet">
            <Input value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} />
          </FormItem>

          <FormItem top="Файл с авторизацией" bottom="Инструкция">
            <File controlSize="m" accept="application/json" onChange={handleFileChange} />
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
              Далее
            </Button>
          </FormItem>
        </FormLayout>
      </Group>
    </>
  );
};
