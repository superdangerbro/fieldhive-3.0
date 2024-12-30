'use client';

import { useState } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

export const useBarcode = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeReader] = useState(() => new BrowserMultiFormatReader());

  const scanBarcodeFromImage = async (imageFile: File): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const imageUrl = URL.createObjectURL(imageFile);
      const result = await codeReader.decodeFromImageUrl(imageUrl);
      URL.revokeObjectURL(imageUrl);
      return result.getText();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan barcode from image');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const scanBarcodeFromCamera = async (): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const videoInputDevices = await codeReader.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices[0]?.deviceId;
      
      if (!selectedDeviceId) {
        throw new Error('No camera found');
      }

      return new Promise((resolve, reject) => {
        codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          'video-stream',
          (result: Result | null, error?: Error) => {
            if (error) {
              reject(error);
              return;
            }
            if (result) {
              resolve(result.getText());
              codeReader.reset();
            }
          }
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan barcode from camera');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cleanup = () => {
    codeReader.reset();
  };

  return {
    scanBarcodeFromCamera,
    scanBarcodeFromImage,
    cleanup,
    isLoading,
    error,
  };
};
