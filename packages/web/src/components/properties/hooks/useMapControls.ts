import { useCallback } from 'react';
import { MapRef } from 'react-map-gl';

export const useMapControls = (
  mapRef: React.RefObject<MapRef>,
  drawControlRef: React.RefObject<any>,
  isDrawing: boolean,
  setIsDrawing: (drawing: boolean) => void,
  lastLocation: React.RefObject<[number, number] | null>
) => {
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      map.zoomIn({ duration: 300 });
    }
  }, [mapRef]);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      const map = mapRef.current.getMap();
      map.zoomOut({ duration: 300 });
    }
  }, [mapRef]);

  const handleDrawToggle = useCallback(() => {
    if (!drawControlRef.current) return;

    try {
      const features = drawControlRef.current.getAll();
      
      if (isDrawing) {
        // If currently drawing and we have enough points, finish the polygon
        if (features.features.length > 0) {
          const currentFeature = features.features[features.features.length - 1];
          if (currentFeature.geometry.coordinates[0].length >= 3) {
            drawControlRef.current.changeMode('simple_select');
            setIsDrawing(false);
          }
        }
      } else {
        // If not drawing, start a new polygon or edit existing one
        if (features.features.length === 0) {
          drawControlRef.current.changeMode('draw_polygon');
          setIsDrawing(true);
        } else {
          // Toggle between select and direct_select modes for existing polygon
          const mode = drawControlRef.current.getMode();
          if (mode === 'simple_select') {
            drawControlRef.current.changeMode('direct_select', {
              featureId: features.features[0].id
            });
            setIsDrawing(true);
          } else {
            drawControlRef.current.changeMode('simple_select');
            setIsDrawing(false);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling draw mode:', error);
    }
  }, [isDrawing, setIsDrawing, drawControlRef]);

  const handleClear = useCallback(() => {
    if (!drawControlRef.current) return;

    try {
      drawControlRef.current.deleteAll();
      // Automatically start drawing mode after clearing
      drawControlRef.current.changeMode('draw_polygon');
      setIsDrawing(true);
    } catch (error) {
      console.error('Error clearing drawing:', error);
    }
  }, [drawControlRef, setIsDrawing]);

  const handleRecenter = useCallback(() => {
    if (mapRef.current && lastLocation.current) {
      const [lng, lat] = lastLocation.current;
      mapRef.current.getMap().flyTo({
        center: [lng, lat],
        zoom: 17,
        duration: 1000,
        speed: 1.5,
        curve: 1,
        essential: true
      });
    }
  }, [mapRef, lastLocation]);

  return {
    handleZoomIn,
    handleZoomOut,
    handleDrawToggle,
    handleClear,
    handleRecenter,
  };
};
