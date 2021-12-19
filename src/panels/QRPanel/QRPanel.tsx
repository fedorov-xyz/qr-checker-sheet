import React, { FC, useEffect, useRef, useState } from 'react';
import { PanelHeader, Group, FormLayout, FormItem, NativeSelect, PanelHeaderBack } from '@vkontakte/vkui';
import QrScanner from 'qr-scanner';
import Camera = QrScanner.Camera;
import styles from './QRPanel.module.css';
import { QRConfig } from '../../AppContext';
import { processValue } from './process';

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

  const onDecode = (value: string) => {
    if (isBusyRef.current) {
      return;
    }

    isBusyRef.current = true;

    addLogEntry(`Отсканировано: "${value}". Обработка...`);

    console.log({ value });
    processValue(value, config)
      .then((value) => {
        addLogEntry(`Обработано: "${value}"`);
        console.log({ value });
      })
      .finally(() => {
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
    </>
  );
};
