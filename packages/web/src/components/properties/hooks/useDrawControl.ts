import { useCallback } from 'react';
import { useMapEvents } from './useMapEvents';
import { FeatureCollection } from 'geojson';

const drawStyles = [
  {
    'id': 'gl-draw-polygon-fill',
    'type': 'fill',
    'filter': ['all', ['==', '$type', 'Polygon']],
    'paint': {
      'fill-color': '#3b82f6',
      'fill-outline-color': '#2563eb',
      'fill-opacity': 0.3
    }
  },
  {
    'id': 'gl-draw-polygon-stroke',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'Polygon']],
    'paint': {
      'line-color': '#2563eb',
      'line-width': 2
    }
  },
  {
    'id': 'gl-draw-polygon-point',
    'type': 'circle',
    'filter': ['all', ['==', '$type', 'Point']],
    'paint': {
      'circle-radius': 4,
      'circle-color': '#fff',
      'circle-stroke-color': '#2563eb',
      'circle-stroke-width': 2
    }
  }
];

export const useDrawControl = (
  mapRef: any,
  drawControlRef: any,
  drawnFeatures: FeatureCollection | null,
  setDrawnFeatures: (features: FeatureCollection) => void,
  isDrawing: boolean,
  setIsDrawing: (drawing: boolean) => void
) => {
  const { setupMapEvents } = useMapEvents(drawControlRef.current, setDrawnFeatures, setIsDrawing, isDrawing);

  const initializeDrawControl = useCallback(async () => {
    if (!mapRef.current || !mapRef.current.getMap()) return;

    try {
      const map = mapRef.current.getMap();
      
      // Remove existing control if it exists
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      }

      // Import MapboxDraw
      const { default: MapboxDraw } = await import('@mapbox/mapbox-gl-draw');
      const drawControl = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        styles: drawStyles,
        defaultMode: 'draw_polygon'
      });

      map.addControl(drawControl);
      drawControlRef.current = drawControl;

      // Restore drawn features if any
      if (drawnFeatures && drawnFeatures.features && drawnFeatures.features.length > 0) {
        drawControl.set(drawnFeatures);
        drawControl.changeMode('simple_select');
        setIsDrawing(false);
      } else {
        // Start drawing mode if no features exist
        drawControl.changeMode('draw_polygon');
        setIsDrawing(true);
      }

      setupMapEvents(map);
    } catch (error) {
      console.error('Error initializing draw control:', error);
    }
  }, [mapRef, drawControlRef, drawnFeatures, setDrawnFeatures, isDrawing, setIsDrawing, setupMapEvents]);

  const cleanupDrawControl = useCallback(() => {
    if (mapRef.current && drawControlRef.current) {
      try {
        const map = mapRef.current.getMap();
        map.removeControl(drawControlRef.current);
        drawControlRef.current = null;
      } catch (error) {
        console.error('Error cleaning up draw control:', error);
      }
    }
  }, [mapRef, drawControlRef]);

  return {
    initializeDrawControl,
    cleanupDrawControl
  };
};
