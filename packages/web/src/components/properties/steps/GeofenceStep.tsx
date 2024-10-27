'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { Box, Alert } from '@mui/material';
import Map, { MapRef } from 'react-map-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import PropertyMapControls from '../PropertyMapControls';
import { useMapControls } from '../hooks/useMapControls';
import { useDrawControl } from '../hooks/useDrawControl';
import { FeatureCollection } from 'geojson';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface GeofenceStepProps {
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
  formErrors: Record<string, string>;
  mapLoaded: boolean;
  setMapLoaded: (loaded: boolean) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  drawnFeatures: FeatureCollection | null;
  setDrawnFeatures: (features: FeatureCollection) => void;
  lastLocation: React.RefObject<[number, number] | null>;
  onGeocodeAddress: () => Promise<void>;
}

export const GeofenceStep: React.FC<GeofenceStepProps> = ({
  showInstructions,
  setShowInstructions,
  formErrors,
  mapLoaded,
  setMapLoaded,
  isDrawing,
  setIsDrawing,
  drawnFeatures,
  setDrawnFeatures,
  lastLocation,
  onGeocodeAddress,
}) => {
  const mapRef = useRef<MapRef>(null);
  const drawControlRef = useRef<any>(null);

  const {
    handleZoomIn,
    handleZoomOut,
    handleDrawToggle,
    handleClear,
    handleRecenter,
  } = useMapControls(mapRef, drawControlRef, isDrawing, setIsDrawing, lastLocation);

  const { initializeDrawControl, cleanupDrawControl } = useDrawControl(
    mapRef,
    drawControlRef,
    drawnFeatures,
    setDrawnFeatures,
    isDrawing,
    setIsDrawing
  );

  // Handle map load
  const handleMapLoad = useCallback(() => {
    setMapLoaded(true);
    // Initialize draw control after map is loaded
    setTimeout(initializeDrawControl, 100);
  }, [initializeDrawControl, setMapLoaded]);

  // Geocode and fly to address when component mounts
  useEffect(() => {
    const flyToLocation = async () => {
      if (!lastLocation.current) {
        await onGeocodeAddress();
      }
      
      if (lastLocation.current && mapRef.current) {
        const [lng, lat] = lastLocation.current;
        const map = mapRef.current.getMap();
        
        map.flyTo({
          center: [lng, lat],
          zoom: 17,
          duration: 1000,
          speed: 1.5,
          curve: 1,
          essential: true
        });
      }
    };

    if (mapLoaded) {
      flyToLocation();
    }
  }, [mapLoaded, onGeocodeAddress, lastLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupDrawControl();
    };
  }, [cleanupDrawControl]);

  return (
    <Box sx={{ height: 400, mt: 2, position: 'relative' }}>
      {showInstructions && (
        <Alert 
          severity="info" 
          onClose={() => setShowInstructions(false)}
          sx={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            zIndex: 1,
            maxWidth: '60%',
            opacity: 0.9,
            m: 1,
            borderRadius: 1
          }}
        >
          Draw a boundary around your property. Click points to create a polygon, double-click to finish.
        </Alert>
      )}
      {formErrors.geofence && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'absolute', 
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            m: 1,
            borderRadius: 1
          }}
        >
          {formErrors.geofence}
        </Alert>
      )}
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: lastLocation.current?.[0] || -98,
          latitude: lastLocation.current?.[1] || 56,
          zoom: lastLocation.current ? 17 : 3,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        onLoad={handleMapLoad}
        dragRotate={false}
        touchZoomRotate={false}
        preserveDrawingBuffer={true}
        doubleClickZoom={false}
        onClick={(e) => {
          // Prevent event bubbling
          e.preventDefault();
        }}
      />
      {mapLoaded && (
        <PropertyMapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onDrawToggle={handleDrawToggle}
          onClear={handleClear}
          onRecenter={handleRecenter}
          isDrawing={isDrawing}
        />
      )}
    </Box>
  );
};
