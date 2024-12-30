'use client';

import { useState } from 'react';

export const useCamera = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCamera = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      return stream;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access camera');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async (videoStream: MediaStream) => {
    const video = document.createElement('video');
    video.srcObject = videoStream;
    await video.play();

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to get canvas context');

    context.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');

    // Clean up
    videoStream.getTracks().forEach(track => track.stop());
    video.remove();
    canvas.remove();

    return dataUrl;
  };

  return {
    openCamera,
    takePhoto,
    isLoading,
    error,
  };
};
