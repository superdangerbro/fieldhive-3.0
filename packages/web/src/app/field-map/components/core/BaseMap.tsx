'use client';

import React, { useRef, useCallback } from 'react';
import Map, { MapRef } from 'react-map-gl';
import { Box, useTheme } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import { useFieldMapStore } from '../../../../stores/fieldMapStore';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

interface BaseMapProps {
  onMoveEnd?: (bounds: [number, number, number, number]) => void;
  children?: React.ReactNode;
}

/**
 * BaseMap component that handles core map functionality.
 * This component is kept minimal to ensure good performance.
 */
const BaseMap: React.FC<BaseMapProps> = ({ onMoveEnd, children }) => {
  const theme = useTheme();
  const mapRef = useRef<MapRef>(null);
  const { viewState, setViewState } = useFieldMapStore();

  const handleMoveEnd = useCallback(() => {
    const map = mapRef.current;
    if (!map || !onMoveEnd) return;
    
    const bounds = map.getBounds();
    if (!bounds) return;

    const boundsArray: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ];
    
    onMoveEnd(boundsArray);
  }, [onMoveEnd]);

  return (
    <Box 
      sx={{ 
        height: '100%',
        width: '100%',
        bgcolor: theme.palette.background.default,
        '& .mapboxgl-ctrl-logo': {
          display: 'none'
        }
      }}
    >
      <Map
        ref={mapRef}
        {...viewState}
        reuseMaps
        mapStyle="mapbox://styles/mapbox/dark-v10"
        onMove={evt => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        attributionControl={false}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        {children}
      </Map>
    </Box>
  );
};

export default BaseMap;
