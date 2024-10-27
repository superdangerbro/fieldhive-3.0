import { useCallback } from 'react';
import { FeatureCollection } from 'geojson';
import { formatGeoJsonCoordinates, createPolygonFeature } from '../utils/geoJson';

export const useDrawHandler = (
  drawControl: any,
  setDrawnFeatures: (features: FeatureCollection) => void,
  setIsDrawing: (drawing: boolean) => void
) => {
  const handleDrawUpdate = useCallback(() => {
    const features = drawControl.getAll();
    if (features.features.length > 0) {
      const feature = features.features[0];
      if (feature.geometry.type === 'Polygon') {
        const coordinates = formatGeoJsonCoordinates(feature.geometry.coordinates[0]);
        const formattedFeature = createPolygonFeature(coordinates);
        setDrawnFeatures(formattedFeature);
      }
    } else {
      setDrawnFeatures({
        type: 'FeatureCollection',
        features: []
      });
    }
  }, [drawControl, setDrawnFeatures]);

  return {
    handleDrawUpdate
  };
};
