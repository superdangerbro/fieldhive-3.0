'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Source, Layer, Marker, MarkerDragEvent } from 'react-map-gl';
import { useFieldMap3DStore } from '../../../stores/fieldMap3dStore';
import mapboxgl from 'mapbox-gl';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';

interface RoughPlacementProps {
  map: mapboxgl.Map;
  onCancel: () => void;
  onContinue: (markers: [number, number][]) => void;
}

export function RoughPlacement({ map, onCancel, onContinue }: RoughPlacementProps) {
  const { placementState } = useFieldMap3DStore();
  const [markers, setMarkers] = useState<[number, number][]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<mapboxgl.Point | null>(null);
  const [dragStartMarkers, setDragStartMarkers] = useState<[number, number][]>([]);
  const [isRotating, setIsRotating] = useState(false);
  const [activeCorner, setActiveCorner] = useState<number | null>(null);

  // Initialize markers at center of viewport
  useEffect(() => {
    if (map) {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const size = Math.pow(2, -zoom) * 50;
      
      const initialMarkers: [number, number][] = [
        [center.lng - size, center.lat + size],
        [center.lng + size, center.lat + size],
        [center.lng + size, center.lat - size],
        [center.lng - size, center.lat - size]
      ];
      
      setMarkers(initialMarkers);
    }
  }, [map]);

  const getRotationHandlePosition = useCallback((): [number, number] => {
    if (markers.length !== 4) return [0, 0];
    
    // Calculate midpoint of top edge
    const x = (markers[0][0] + markers[1][0]) / 2;
    const y = (markers[0][1] + markers[1][1]) / 2;
    
    // Move handle up from the edge
    const offset = Math.abs(markers[1][1] - markers[2][1]) * 0.2;
    return [x, y + offset];
  }, [markers]);

  const handleImageDragStart = (e: React.MouseEvent) => {
    if (!map || isRotating || activeCorner !== null) return;
    
    map.dragPan.disable();
    const point = new mapboxgl.Point(e.clientX, e.clientY);
    setDragStartPoint(point);
    setDragStartMarkers([...markers]);
    setIsDragging(true);
  };

  const handleImageDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartPoint || !dragStartMarkers || !map) return;

    const currentPoint = new mapboxgl.Point(e.clientX, e.clientY);
    const startLngLat = map.unproject(dragStartPoint);
    const currentLngLat = map.unproject(currentPoint);

    const dx = currentLngLat.lng - startLngLat.lng;
    const dy = currentLngLat.lat - startLngLat.lat;

    const newMarkers = dragStartMarkers.map(marker => [
      marker[0] + dx,
      marker[1] + dy
    ] as [number, number]);

    setMarkers(newMarkers);
  }, [isDragging, dragStartPoint, dragStartMarkers, map]);

  const handleImageDragEnd = useCallback(() => {
    if (map) {
      map.dragPan.enable();
    }
    setIsDragging(false);
    setDragStartPoint(null);
    setDragStartMarkers([]);
  }, [map]);

  const handleRotationStart = (e: MarkerDragEvent) => {
    if (!map) return;
    map.dragPan.disable();
    setIsRotating(true);
    setDragStartPoint(map.project(new mapboxgl.LngLat(e.lngLat.lng, e.lngLat.lat)));
  };

  const handleRotationMove = useCallback((e: MarkerDragEvent) => {
    if (!isRotating || !dragStartPoint || !map) return;

    const center = markers.reduce(
      (acc, m) => [acc[0] + m[0], acc[1] + m[1]],
      [0, 0]
    ).map(v => v / markers.length);

    const centerPoint = map.project(new mapboxgl.LngLat(center[0], center[1]));
    const startVector = {
      x: dragStartPoint.x - centerPoint.x,
      y: dragStartPoint.y - centerPoint.y
    };
    const currentPoint = map.project(new mapboxgl.LngLat(e.lngLat.lng, e.lngLat.lat));
    const currentVector = {
      x: currentPoint.x - centerPoint.x,
      y: currentPoint.y - centerPoint.y
    };

    const angle = Math.atan2(currentVector.y, currentVector.x) - 
                 Math.atan2(startVector.y, startVector.x);

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const newMarkers = markers.map(marker => {
      const point = map.project(new mapboxgl.LngLat(marker[0], marker[1]));
      const dx = point.x - centerPoint.x;
      const dy = point.y - centerPoint.y;
      const rotated = map.unproject(new mapboxgl.Point(
        centerPoint.x + dx * cos - dy * sin,
        centerPoint.y + dx * sin + dy * cos
      ));
      return [rotated.lng, rotated.lat] as [number, number];
    });

    setMarkers(newMarkers);
    setDragStartPoint(currentPoint);
  }, [isRotating, dragStartPoint, markers, map]);

  const handleRotationEnd = () => {
    if (map) {
      map.dragPan.enable();
    }
    setIsRotating(false);
    setDragStartPoint(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleImageDragMove);
      document.addEventListener('mouseup', handleImageDragEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleImageDragMove);
      document.removeEventListener('mouseup', handleImageDragEnd);
    };
  }, [isDragging, handleImageDragMove, handleImageDragEnd]);

  if (!placementState?.imageUrl || markers.length !== 4) return null;

  const rotationHandle = getRotationHandlePosition();

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

      {/* Corner Markers */}
      {markers.map((marker, index) => (
        <Marker
          key={index}
          longitude={marker[0]}
          latitude={marker[1]}
          draggable
          onDragStart={() => {
            map.dragPan.disable();
            setActiveCorner(index);
          }}
          onDrag={(e) => {
            const newMarkers = [...markers];
            newMarkers[index] = [e.lngLat.lng, e.lngLat.lat];
            setMarkers(newMarkers);
          }}
          onDragEnd={() => {
            map.dragPan.enable();
            setActiveCorner(null);
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: 'white',
            border: '3px solid blue',
            borderRadius: '50%',
            cursor: 'move',
            transform: `scale(${activeCorner === index ? 1.2 : 1})`,
            transition: 'transform 0.2s'
          }} />
        </Marker>
      ))}

      {/* Rotation Handle */}
      <Marker
        longitude={rotationHandle[0]}
        latitude={rotationHandle[1]}
        draggable
        onDragStart={handleRotationStart}
        onDrag={handleRotationMove}
        onDragEnd={handleRotationEnd}
      >
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: 'white',
          border: '3px solid green',
          borderRadius: '50%',
          cursor: 'move',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${isRotating ? 1.2 : 1})`,
          transition: 'transform 0.2s'
        }}>
          <RotateLeftIcon style={{ color: 'green', fontSize: '24px' }} />
        </div>
      </Marker>

      {/* Drag Area */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 1,
          pointerEvents: isRotating || activeCorner !== null ? 'none' : 'all'
        }}
        onMouseDown={handleImageDragStart}
      />

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
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={() => onContinue(markers)}
        >
          Fine Tune Placement
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
        Drag image to move • Use corners to resize • Use handle to rotate
      </Typography>
    </>
  );
}
