'use client';

import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Marker, Source, Layer } from 'react-map-gl';
import { useFieldMap3DStore } from '../../../stores/fieldMap3dStore';
import mapboxgl from 'mapbox-gl';

interface FinePlacementProps {
  map: mapboxgl.Map;
  initialMarkers: [number, number][];
  onCancel: () => void;
  onConfirm: (bounds: {
    west: number;
    east: number;
    north: number;
    south: number;
    coordinates: [number, number][];
  }) => void;
}

export function FinePlacement({ map, initialMarkers, onCancel, onConfirm }: FinePlacementProps) {
  const { placementState } = useFieldMap3DStore();
  const [markers, setMarkers] = useState<[number, number][]>(initialMarkers);
  const [activeMarkerIndex, setActiveMarkerIndex] = useState<number | null>(null);

  const handleMarkerDragStart = (index: number) => {
    if (map) {
      map.dragPan.disable();
      setActiveMarkerIndex(index);
    }
  };

  const handleMarkerDrag = (index: number, lngLat: [number, number]) => {
    setMarkers(prev => {
      const newMarkers = [...prev];
      newMarkers[index] = lngLat;
      return newMarkers;
    });
  };

  const handleMarkerDragEnd = () => {
    if (map) {
      map.dragPan.enable();
      setActiveMarkerIndex(null);
    }
  };

  const handleConfirm = () => {
    if (markers.length === 4) {
      const lngs = markers.map(m => m[0]);
      const lats = markers.map(m => m[1]);

      const bounds = {
        west: Math.min(...lngs),
        east: Math.max(...lngs),
        north: Math.max(...lats),
        south: Math.min(...lats),
        coordinates: markers
      };

      onConfirm(bounds);
    }
  };

  if (!placementState?.imageUrl) return null;

  return (
    <>
      <Source
        type="image"
        id="preview-image"
        url={placementState.imageUrl}
        coordinates={markers}
      >
        <Layer
          id="preview-layer"
          type="raster"
          paint={{
            'raster-opacity': 0.7,
            'raster-fade-duration': 0
          }}
        />
      </Source>

      {markers.map((marker, index) => (
        <Marker
          key={index}
          longitude={marker[0]}
          latitude={marker[1]}
          draggable
          onDragStart={() => handleMarkerDragStart(index)}
          onDrag={(e) => handleMarkerDrag(index, [e.lngLat.lng, e.lngLat.lat])}
          onDragEnd={handleMarkerDragEnd}
        >
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'white',
            border: '3px solid blue',
            borderRadius: '50%',
            cursor: 'move',
            zIndex: activeMarkerIndex === index ? 4 : 3,
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            transform: `scale(${activeMarkerIndex === index ? 1.2 : 1})`,
            transition: 'transform 0.2s'
          }} />
        </Marker>
      ))}

      <Box
        sx={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 2,
          zIndex: 1001
        }}
      >
        <Button variant="outlined" onClick={onCancel}>
          Back
        </Button>
        <Button 
          variant="contained" 
          onClick={handleConfirm}
          disabled={markers.length !== 4}
        >
          Confirm Placement
        </Button>
      </Box>

      <Typography
        variant="h6"
        sx={{
          position: 'absolute',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          textShadow: '0 0 4px rgba(0,0,0,0.5)',
          textAlign: 'center',
          pointerEvents: 'none',
          zIndex: 1001,
          maxWidth: '80%'
        }}
      >
        Drag corners to fine-tune placement
      </Typography>
    </>
  );
}
