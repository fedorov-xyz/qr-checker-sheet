import React, { FC, useEffect, useRef, useState } from 'react';
import { PanelHeader, Group, FormLayout, FormItem, NativeSelect, PanelHeaderBack } from '@vkontakte/vkui';
import QrScanner from 'qr-scanner';
import Camera = QrScanner.Camera;
import styles from './QRPanel.module.css';
import { QRConfig } from '../../AppContext';

const workerPath = new URL('~/node_modules/qr-scanner/qr-scanner-worker.min.js', import.meta.url);
QrScanner.WORKER_PATH = workerPath.toString();

interface Props {
  config: QRConfig;
}

export const QRPanel: FC<Props> = ({}) => {
  const scannerRef = useRef<QrScanner | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameras, setCameras] = useState<Camera[]>([]);

  let isBusyRef = useRef(false);

  const onDecode = (value: string) => {
    if (isBusyRef.current) {
      return;
    }

    isBusyRef.current = true;

    console.log(value);

    setTimeout(() => {
      isBusyRef.current = false;
    }, 1000);
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
              <video width={500} height={500} ref={videoRef} className={styles.video} />
            </div>
          </FormItem>

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
