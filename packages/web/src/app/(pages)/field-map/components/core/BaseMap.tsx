'use client';

import React, { useCallback, useEffect, forwardRef, useRef, useState } from 'react';
import Map, { MapRef, GeolocateControl } from 'react-map-gl';
import { Box, useTheme } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import { useFieldMap } from '../../../../../app/globalHooks/useFieldMap';

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
 * - Automatic geolocation tracking
 * - Child component rendering (markers, overlays, etc.)
 */
export const BaseMap = forwardRef<MapRef, BaseMapProps>(({
  onMoveEnd,
  onTrackingStart,
  onTrackingEnd,
  children
}, ref) => {
  const theme = useTheme();
  const { viewState, setViewState, mapRef } = useFieldMap();
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl>(null);
  const [isTracking, setIsTracking] = useState(false);
  const mapInitializedRef = useRef(false);

  // Set initial bounds when map loads
  useEffect(() => {
    const map = (ref as React.RefObject<MapRef>)?.current;
    if (map && !mapInitializedRef.current && onMoveEnd) {
      mapInitializedRef.current = true;
      const bounds = map.getBounds();
      if (bounds) {
        const boundsArray: [number, number, number, number] = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth()
        ];
        console.log('Setting initial bounds:', boundsArray);
        onMoveEnd(boundsArray);
      }
    }
  }, [ref, onMoveEnd]);

  // Store map instance in ref
  useEffect(() => {
    const map = (ref as React.RefObject<MapRef>)?.current?.getMap();
    if (map) {
      mapRef.current = map;
    }
  }, [ref, mapRef]);

  // Automatically start tracking on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (geolocateControlRef.current) {
        console.log('Automatically triggering location tracking');
        geolocateControlRef.current.trigger();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleMoveEnd = useCallback(() => {
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

  const handleMove = useCallback((evt: { viewState: typeof viewState }) => {
    console.log('View state updated:', evt.viewState);
    setViewState(evt.viewState);
  }, [setViewState]);

  useEffect(() => {
    const onGeolocate = () => {
      setIsTracking(true);
      onTrackingStart?.();
    };

    const onGeolocateEnd = () => {
      setIsTracking(false);
      onTrackingEnd?.();
    };

    if (geolocateControlRef.current) {
      geolocateControlRef.current.on('geolocate', onGeolocate);
      geolocateControlRef.current.on('trackuserlocationend', onGeolocateEnd);
    }

    return () => {
      if (geolocateControlRef.current) {
        geolocateControlRef.current.off('geolocate', onGeolocate);
        geolocateControlRef.current.off('trackuserlocationend', onGeolocateEnd);
      }
    };
  }, [onTrackingStart, onTrackingEnd]);

  return (
    <Box 
      sx={{ 
        height: '100%',
        width: '100%',
        bgcolor: theme.palette.background.default,
        position: 'relative',
        '& .mapboxgl-ctrl-logo': {
          display: 'none'
        },
        '& .mapboxgl-ctrl-group': {
          background: 'none !important',
          border: 'none !important',
          boxShadow: 'none !important'
        },
        '& button.mapboxgl-ctrl-geolocate': {
          width: '40px !important',
          height: '40px !important',
          borderRadius: '50% !important',
          backgroundColor: 'blue !important',
          border: 'none !important',
          margin: '3px !important',
          padding: '8px !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '& button.mapboxgl-ctrl-geolocate .mapboxgl-ctrl-icon': {
          filter: 'brightness(0) invert(1) !important',
          width: '24px !important',
          height: '24px !important',
        },
        '& button.mapboxgl-ctrl-geolocate-active': {
          backgroundColor: 'blue !important',
          animation: isTracking ? 'pulse 2s infinite !important' : 'none !important',
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.4)'
            },
            '70%': {
              boxShadow: '0 0 0 10px rgba(33, 150, 243, 0)'
            },
            '100%': {
              boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)'
            }
          }
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
        onLoad={handleMoveEnd}
        attributionControl={false}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <GeolocateControl
          ref={geolocateControlRef}
          position="top-right"
          trackUserLocation
          showUserHeading
          showAccuracyCircle={false}
          positionOptions={{ enableHighAccuracy: true }}
          onTrackUserLocationStart={() => {
            console.log('Location tracking started');
            setIsTracking(true);
            onTrackingStart?.();
          }}
          onTrackUserLocationEnd={() => {
            console.log('Location tracking ended');
            setIsTracking(false);
            onTrackingEnd?.();
          }}
        />
        {children}
      </Map>
    </Box>
  );
});

// Display name for React DevTools
BaseMap.displayName = 'BaseMap';
