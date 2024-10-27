import { useCallback } from 'react';
import { useDrawHandler } from './useDrawHandler';

export const useMapEvents = (
  drawControl: any,
  setDrawnFeatures: any,
  setIsDrawing: (drawing: boolean) => void,
  isDrawing: boolean
) => {
  const { handleDrawUpdate } = useDrawHandler(drawControl, setDrawnFeatures, setIsDrawing);

  const setupMapEvents = useCallback((map: any) => {
    // Save drawn features when they change
    map.on('draw.create', handleDrawUpdate);
    map.on('draw.update', handleDrawUpdate);

    map.on('draw.delete', () => {
      setDrawnFeatures({
        type: 'FeatureCollection',
        features: []
      });
      // Restart drawing mode after delete
      drawControl.changeMode('draw_polygon');
      setIsDrawing(true);
    });

    // Handle double click to finish polygon
    let lastClickTime = 0;
    map.on('mousedown', (e: any) => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastClickTime;
      
      if (timeDiff < 300 && isDrawing) { // 300ms threshold for double click
        const features = drawControl.getAll();
        if (features.features.length > 0) {
          const currentFeature = features.features[features.features.length - 1];
          if (currentFeature.geometry.coordinates[0].length >= 3) {
            e.preventDefault(); // Prevent default double click behavior
            drawControl.changeMode('simple_select');
            setIsDrawing(false);
            handleDrawUpdate();
          }
        }
      }
      
      lastClickTime = currentTime;
    });

    // Disable double click zoom
    map.doubleClickZoom.disable();
  }, [drawControl, handleDrawUpdate, isDrawing, setDrawnFeatures, setIsDrawing]);

  return {
    setupMapEvents
  };
};
