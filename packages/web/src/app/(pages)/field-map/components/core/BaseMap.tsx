'use client';

import React, { useCallback, useEffect, forwardRef } from 'react';
import Map, { MapRef, GeolocateControl } from 'react-map-gl';
import { Box, useTheme } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import { useFieldMap } from '@/app/globalHooks/useFieldMap';

// Initialize Mapbox token
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  console.error('NEXT_PUBLIC_MAPBOX_TOKEN is not defined');
} else {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

interface BaseMapProps {
  /** Callback fired when map stops moving, provides bounds array */
  onMoveEnd?: (bounds: [number, number, number, number]) => void;
  /** Callback fired when geolocation tracking starts */
  onTrackingStart?: () => void;
  /** Callback fired when geolocation tracking ends */
  onTrackingEnd?: () => void;
  /** Child components to render within the map */
  children?: React.ReactNode;
}

/**
 * BaseMap component provides core map functionality.
 * Features:
 * - Map initialization with Mapbox GL
 * - View state management
 * - Bounds tracking
 * - Geolocation control
 * - Child component rendering (markers, overlays, etc.)
 */
export const BaseMap = forwardRef<MapRef, BaseMapProps>(({
  onMoveEnd,
  onTrackingStart,
  onTrackingEnd,
  children
}, ref) => {
  const theme = useTheme();
  const { viewState, setViewState } = useFieldMap();

  // Debug map initialization
  useEffect(() => {
    // Type assertion since we know ref.current will be MapRef when available
    const map = (ref as React.RefObject<MapRef>)?.current?.getMap();
    if (map) {
      const style = map.getStyle();
      console.log('Map initialized with style:', style?.name || 'unknown');
      console.log('Initial center:', [map.getCenter().lng, map.getCenter().lat]);
      console.log('Initial zoom:', map.getZoom());
    }
  }, [ref]);

  /**
   * Handles map movement end, calculating and providing new bounds
   */
  const handleMoveEnd = useCallback(() => {
    // Type assertion for ref access
    const map = (ref as React.RefObject<MapRef>)?.current;
    if (!map || !onMoveEnd) return;
    
    const bounds = map.getBounds();
    if (!bounds) {
      console.warn('Could not get map bounds');
      return;
    }

    const boundsArray: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ];
    
    console.log('Map moved, new bounds:', boundsArray);
    onMoveEnd(boundsArray);
  }, [onMoveEnd, ref]);

  /**
   * Handles view state changes from map interactions
   */
  const handleMove = useCallback((evt: { viewState: typeof viewState }) => {
    console.log('View state updated:', evt.viewState);
    setViewState(evt.viewState);
  }, [setViewState]);

  return (
    <Box 
      sx={{ 
        height: '100%',
        width: '100%',
        bgcolor: theme.palette.background.default,
        position: 'relative',
        // Hide Mapbox logo as in original
        '& .mapboxgl-ctrl-logo': {
          display: 'none'
        }
      }}
    >
      <Map
        ref={ref}
        {...viewState}
        reuseMaps
        mapStyle="mapbox://styles/mapbox/dark-v10"
        onMove={handleMove}
        onMoveEnd={handleMoveEnd}
        attributionControl={false}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        {/* Geolocation control with tracking */}
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
          showAccuracyCircle={false}
          positionOptions={{ enableHighAccuracy: true }}
          onTrackUserLocationStart={() => {
            console.log('Location tracking started');
            onTrackingStart?.();
          }}
          onTrackUserLocationEnd={() => {
            console.log('Location tracking ended');
            onTrackingEnd?.();
          }}
        />

        {/* Render child components (markers, overlays, etc.) */}
        {children}
      </Map>
    </Box>
  );
});

// Display name for React DevTools
BaseMap.displayName = 'BaseMap';
