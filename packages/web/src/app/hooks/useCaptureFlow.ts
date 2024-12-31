'use client';

import { useState } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

type CaptureStep = 'barcode' | 'photo' | 'done';

export const useCaptureFlow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeReader] = useState(() => new BrowserMultiFormatReader());
  const [currentStep, setCurrentStep] = useState<CaptureStep>('barcode');
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const startCapture = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      setVideoStream(stream);
      setCurrentStep('barcode');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start capture');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const scanBarcode = async (): Promise<string> => {
    if (!videoStream) throw new Error('No video stream available');

    try {
      const videoInputDevices = await codeReader.listVideoInputDevices();
      const selectedDeviceId = videoInputDevices[0]?.deviceId;
      
      if (!selectedDeviceId) {
        throw new Error('No camera found');
      }

      return new Promise((resolve) => {
        codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          'video-stream',
          (result: Result | null, error?: Error) => {
            if (result) {
              // Don't reset the reader yet - we'll use the same stream for the photo
              setCurrentStep('photo');
              resolve(result.getText());
            }
          }
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan barcode');
      throw err;
    }
  };

  const compressImage = async (dataUrl: string, maxWidth = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Use better quality settings for small images
        ctx!.imageSmoothingEnabled = true;
        ctx!.imageSmoothingQuality = 'high';
        
        ctx!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = dataUrl;
    });
  };

  const takePhoto = async (): Promise<string> => {
    if (!videoStream) throw new Error('No video stream available');

    const video = document.getElementById('video-stream') as HTMLVideoElement;
    if (!video) throw new Error('Video element not found');

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get canvas context');

    context.drawImage(video, 0, 0);
    const fullSizeDataUrl = canvas.toDataURL('image/jpeg');

    // Compress the image before returning
    const compressedDataUrl = await compressImage(fullSizeDataUrl);
    
    setCurrentStep('done');
    return compressedDataUrl;
  };

  const cleanup = () => {
    videoStream?.getTracks().forEach(track => track.stop());
    codeReader.reset();
    setVideoStream(null);
    setCurrentStep('barcode');
    setError(null);
  };

  return {
    startCapture,
    scanBarcode,
    takePhoto,
    cleanup,
    currentStep,
    isLoading,
    error,
  };
};
