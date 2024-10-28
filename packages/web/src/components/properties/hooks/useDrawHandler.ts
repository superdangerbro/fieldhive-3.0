import { useCallback } from 'react';
import { FeatureCollection, Polygon } from 'geojson';

export const useDrawHandler = (
  drawControl: any,
  setDrawnFeatures: (features: FeatureCollection) => void,
  setIsDrawing: (drawing: boolean) => void,
  setPropertyData: (data: any) => void
) => {
  const handleDrawUpdate = useCallback(() => {
    try {
      if (!drawControl) {
        console.log('No draw control available');
        return;
      }

      const features = drawControl.getAll();
      console.log('Processing features in handleDrawUpdate:', features);

      if (features.features.length > 0) {
        const feature = features.features[0];
        if (feature.geometry.type === 'Polygon') {
          // Create properly typed FeatureCollection
          const featureCollection: FeatureCollection = {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: {},
              geometry: feature.geometry
            }]
          };

          console.log('Setting drawn features:', featureCollection);
          setDrawnFeatures(featureCollection);
          
          // Update property data with the polygon geometry
          const polygonGeometry: Polygon = {
            type: 'Polygon',
            coordinates: feature.geometry.coordinates
          };

          console.log('Setting property boundary:', polygonGeometry);
          setPropertyData((prev: any) => {
            const newData = {
              ...prev,
              boundary: polygonGeometry
            };
            console.log('Updated property data:', newData);
            return newData;
          });
        } else {
          console.log('Feature is not a polygon:', feature.geometry.type);
        }
      } else {
        console.log('No features found');
        setDrawnFeatures({
          type: 'FeatureCollection',
          features: []
        });
        setPropertyData((prev: any) => ({
          ...prev,
          boundary: null
        }));
      }
    } catch (error) {
      console.error('Error in handleDrawUpdate:', error);
    }
  }, [drawControl, setDrawnFeatures, setPropertyData]);

  return {
    handleDrawUpdate
  };
};
