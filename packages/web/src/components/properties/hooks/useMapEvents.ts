import { useCallback } from 'react';
import { useDrawHandler } from './useDrawHandler';
import { PropertyFormData } from '../types';

export const useMapEvents = (
  drawControl: any,
  setDrawnFeatures: any,
  setIsDrawing: (drawing: boolean) => void,
  isDrawing: boolean,
  setPropertyData: (data: any) => void
) => {
  const { handleDrawUpdate } = useDrawHandler(drawControl, setDrawnFeatures, setIsDrawing, setPropertyData);

  const setupMapEvents = useCallback((map: any) => {
    // Save drawn features when they change
    map.on('draw.create', (e: any) => {
      console.log('draw.create event:', e);
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        console.log('Created polygon coordinates:', feature.geometry.coordinates);
        handleDrawUpdate();
      }
    });

    map.on('draw.update', (e: any) => {
      console.log('draw.update event:', e);
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        console.log('Updated polygon coordinates:', feature.geometry.coordinates);
        handleDrawUpdate();
      }
    });

    map.on('draw.delete', () => {
      console.log('Polygon deleted');
      setDrawnFeatures({
        type: 'FeatureCollection',
        features: []
      });
      setPropertyData((prev: PropertyFormData) => ({
        ...prev,
        boundary: null
      }));
      // Restart drawing mode after delete
      drawControl.changeMode('draw_polygon');
      setIsDrawing(true);
    });

    // Handle polygon completion
    map.on('draw.modechange', (e: any) => {
      console.log('draw.modechange event:', e);
      const mode = e.mode;
      console.log('Draw mode changed to:', mode);
      
      if (mode === 'simple_select') {
        const features = drawControl.getAll();
        console.log('Current features:', features);
        if (features.features.length > 0) {
          handleDrawUpdate();
          setIsDrawing(false);
        }
      } else if (mode === 'draw_polygon') {
        setIsDrawing(true);
      }
    });

    // Track polygon points during drawing
    map.on('draw.selectionchange', (e: any) => {
      console.log('draw.selectionchange event:', e);
      if (isDrawing && drawControl) {
        const features = drawControl.getAll();
        if (features.features.length > 0) {
          const currentFeature = features.features[features.features.length - 1];
          console.log('Current polygon points:', currentFeature.geometry.coordinates);
        }
      }
    });

    // Disable double click zoom
    map.doubleClickZoom.disable();
  }, [drawControl, handleDrawUpdate, isDrawing, setDrawnFeatures, setIsDrawing, setPropertyData]);

  return {
    setupMapEvents
  };
};
