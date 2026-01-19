import { useState, useCallback } from 'react';
import { IPC_CHANNELS } from '../../shared/constants';
import type { Point, Region, MatchResult } from '../../shared/types';

export function useScreen() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<Point | null>(null);

  const captureScreen = useCallback(async (region?: Region): Promise<string | null> => {
    setIsCapturing(true);
    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.SCREEN_CAPTURE, { region });
      if (res.success && res.data) {
        const imageData = `data:image/png;base64,${res.data}`;
        setLastCapture(imageData);
        return imageData;
      }
      return null;
    } catch (error) {
      console.error('Failed to capture screen:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const findImage = useCallback(
    async (
      templateName: string,
      confidence?: number,
      region?: Region
    ): Promise<MatchResult | null> => {
      try {
        const res = await window.electronAPI.invoke(IPC_CHANNELS.SCREEN_FIND_IMAGE, {
          templateName,
          confidence,
          region,
        });
        if (res.success && res.data) {
          return res.data as MatchResult;
        }
        return null;
      } catch (error) {
        console.error('Failed to find image:', error);
        return null;
      }
    },
    []
  );

  const getMousePosition = useCallback(async (): Promise<Point | null> => {
    try {
      const res = await window.electronAPI.invoke(IPC_CHANNELS.SCREEN_GET_MOUSE_POSITION);
      if (res.success && res.data) {
        const pos = res.data as Point;
        setMousePosition(pos);
        return pos;
      }
      return null;
    } catch (error) {
      console.error('Failed to get mouse position:', error);
      return null;
    }
  }, []);

  return {
    isCapturing,
    lastCapture,
    mousePosition,
    captureScreen,
    findImage,
    getMousePosition,
  };
}
