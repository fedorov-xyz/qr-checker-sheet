import React, { ComponentProps, FC, ReactNode, useEffect, useRef, useState } from 'react';
import {
  PanelHeader,
  Group,
  FormLayout,
  FormItem,
  NativeSelect,
  PanelHeaderBack,
  Avatar,
  Snackbar,
} from '@vkontakte/vkui';
import QrScanner from 'qr-scanner';
import Camera = QrScanner.Camera;
import styles from './QRPanel.module.css';
import { QRConfig } from '../../AppContext';
import { processValue } from './process';
import { Icon16Done, Icon16ErrorCircle, Icon16WarningTriangle } from '@vkontakte/icons';
import { parseSheet } from './sheet';

const workerPath = new URL('~/node_modules/qr-scanner/qr-scanner-worker.min.js', import.meta.url);
QrScanner.WORKER_PATH = workerPath.toString();

interface Props {
  config: QRConfig;
}

interface LogEntry {
  date: Date;
  message: string;
}

export const QRPanel: FC<Props> = ({ config }) => {
  const scannerRef = useRef<QrScanner | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  let isBusyRef = useRef(false);

  const codeLogsRef = useRef<HTMLElement | null>(null);

  const [snackbar, setSnackbar] = useState<ReactNode>(null);

  const showSnackbar = (mode: 'success' | 'warn' | 'error', message: string) => {
    let iconBackground: string;
    let Icon: FC<ComponentProps<typeof Icon16Done>>;

    switch (mode) {
      case 'success':
        iconBackground = styles.snackbarIconSuccess;
        Icon = Icon16Done;
        break;
      case 'warn':
        iconBackground = styles.snackbarIconWarning;
        Icon = Icon16WarningTriangle;
        break;
      case 'error':
        iconBackground = styles.snackbarIconError;
        Icon = Icon16ErrorCircle;
        break;
    }

    setSnackbar(
      <Snackbar
        key={message}
        duration={3400}
        onClose={() => setSnackbar(null)}
        before={
          <Avatar size={24} className={iconBackground}>
            <Icon className={styles.snackbarIcon} />
          </Avatar>
        }
      >
        {message}
      </Snackbar>,
    );
  };

  useEffect(() => {
    const codeLogsEl = codeLogsRef.current;
    if (codeLogsEl) {
      codeLogsEl.scrollTop = codeLogsEl.scrollHeight;
    }
  });

  const addLogEntry = (message: string) => {
    setLogs((logs) => {
      return [...logs, { date: new Date(), message }];
    });
  };

  const process = async (raw: string) => {
    addLogEntry(`Отсканировано: "${raw}". Обработка...`);

    const value = await processValue(raw, config);
    addLogEntry(`Обработано: "${value}"`);

    const { spreadsheet } = config;
    const { sheetDone, allowed, done } = await parseSheet(spreadsheet);

    if (!allowed.includes(value)) {
      showSnackbar('error', 'Значение не найдено в списке возможных');
      addLogEntry('Значение не найдено на первом листе таблицы');
      return;
    }

    const doneEntry = done.find((data) => data.value === value);
    if (doneEntry) {
      const message = `Значение уже было сохранено ${doneEntry.date}`;
      showSnackbar('warn', message);
      addLogEntry(message);
      return;
    }

    addLogEntry('Сохранение...');

    await sheetDone.addRow([
      new Date().toLocaleString('ru', {
        timeZone: spreadsheet.timeZone,
        hour12: false,
      }),
      value,
    ]);

    showSnackbar('success', 'Значение сохранено!');
    addLogEntry('Значение записано на второй лист');
  };

  const onDecode = (value: string) => {
    if (isBusyRef.current) {
      return;
    }

    isBusyRef.current = true;

    process(value).finally(() => {
      setTimeout(() => {
        addLogEntry('Готово к новому сканированию');
        isBusyRef.current = false;
      }, 2000);
    });
  };

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) {
      return;
    }

    QrScanner.listCameras(true).then((cameras) => {
      setCameras(cameras);
    });

    const scanner = new QrScanner(videoEl, onDecode, () => undefined);

    scannerRef.current = scanner;
    scanner.start();

    return () => {
      scanner.stop();
    };
  }, []);

  return (
    <>
      <PanelHeader left={<PanelHeaderBack onClick={() => window.history.back()} />}>Сканирование</PanelHeader>

      <Group>
        <FormLayout>
          <FormItem>
            <div className={styles.videoContainer}>
              <video width={380} height={380} ref={videoRef} className={styles.video} />
            </div>
          </FormItem>

          {logs.length > 0 && (
            <FormItem top="Лог сканирования">
              <code className={styles.code} ref={codeLogsRef}>
                {logs.map(({ date, message }) => {
                  return <div key={date.getTime()}>{`[${date.toLocaleTimeString()}] ${message}`}</div>;
                })}
              </code>
            </FormItem>
          )}

          <FormItem top="Выберите камеру">
            <NativeSelect
              onChange={(e) => {
                const scanner = scannerRef.current;
                if (scanner) {
                  scanner.setCamera(e.target.value);
                }
              }}
            >
              {cameras.map((camera) => {
                return <option key={camera.id}>{camera.label}</option>;
              })}
            </NativeSelect>
          </FormItem>
        </FormLayout>
      </Group>

      {snackbar}
    </>
  );
};
