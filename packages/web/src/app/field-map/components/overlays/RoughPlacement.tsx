'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import mapboxgl from 'mapbox-gl';

interface RoughPlacementProps {
  /** Mapbox map instance */
  map: mapboxgl.Map;
  /** Handler for confirming placement */
  onConfirm: (bounds: {
    west: number;
    east: number;
    north: number;
    south: number;
    coordinates: [number, number][];
  }) => void;
  /** Handler for canceling placement */
  onCancel: () => void;
}

/**
 * Component for initial rough floor plan placement
 * Features:
 * - Click and drag interface
 * - Visual preview box
 * - Coordinate calculation
 * - Bounds generation
 * 
 * @component
 * @example
 * ```tsx
 * <RoughPlacement
 *   map={mapInstance}
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const RoughPlacement: React.FC<RoughPlacementProps> = ({ 
  map, 
  onConfirm, 
  onCancel 
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<mapboxgl.LngLat | null>(null);
  const [endPoint, setEndPoint] = useState<mapboxgl.LngLat | null>(null);
  const boxRef = useRef<mapboxgl.Marker | null>(null);

  // Set up map event handlers
  useEffect(() => {
    const handleMouseDown = (e: mapboxgl.MapMouseEvent) => {
      if (!isDrawing) {
        setIsDrawing(true);
        setStartPoint(e.lngLat);
      }
    };

    const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
      if (isDrawing && startPoint) {
        setEndPoint(e.lngLat);
      }
    };

    const handleMouseUp = () => {
      if (isDrawing) {
        setIsDrawing(false);
      }
    };

    map.on('mousedown', handleMouseDown);
    map.on('mousemove', handleMouseMove);
    map.on('mouseup', handleMouseUp);

    return () => {
      map.off('mousedown', handleMouseDown);
      map.off('mousemove', handleMouseMove);
      map.off('mouseup', handleMouseUp);
    };
  }, [map, isDrawing, startPoint]);

  // Update preview box
  useEffect(() => {
    if (startPoint && endPoint) {
      if (boxRef.current) {
        boxRef.current.remove();
      }

      const bounds = new mapboxgl.LngLatBounds(startPoint, endPoint);
      const coordinates: [number, number][] = [
        [bounds.getWest(), bounds.getSouth()],
        [bounds.getEast(), bounds.getSouth()],
        [bounds.getEast(), bounds.getNorth()],
        [bounds.getWest(), bounds.getNorth()],
      ];

      const el = document.createElement('div');
      el.className = 'floor-plan-box';
      el.style.border = '2px solid #3388ff';
      el.style.backgroundColor = 'rgba(51, 136, 255, 0.2)';
      el.style.position = 'absolute';
      el.style.top = '0';
      el.style.left = '0';
      el.style.right = '0';
      el.style.bottom = '0';

      boxRef.current = new mapboxgl.Marker(el)
        .setLngLat(bounds.getCenter())
        .addTo(map);

      const { x, y } = map.project(bounds.getCenter());
      const { x: x1, y: y1 } = map.project(bounds.getSouthWest());
      const { x: x2, y: y2 } = map.project(bounds.getNorthEast());

      el.style.width = `${Math.abs(x2 - x1)}px`;
      el.style.height = `${Math.abs(y2 - y1)}px`;
      el.style.transform = `translate(${-Math.abs(x2 - x1) / 2}px, ${-Math.abs(y2 - y1) / 2}px)`;
    }
  }, [map, startPoint, endPoint]);

  const handleConfirm = () => {
    if (startPoint && endPoint) {
      const bounds = new mapboxgl.LngLatBounds(startPoint, endPoint);
      const coordinates: [number, number][] = [
        [bounds.getWest(), bounds.getSouth()],
        [bounds.getEast(), bounds.getSouth()],
        [bounds.getEast(), bounds.getNorth()],
        [bounds.getWest(), bounds.getNorth()],
      ];
      onConfirm({
        west: bounds.getWest(),
        east: bounds.getEast(),
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        coordinates,
      });
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1000,
        backgroundColor: 'background.paper',
        padding: 2,
        borderRadius: 1,
        boxShadow: 3,
      }}
    >
      <Typography variant="body1" gutterBottom>
        Click and drag on the map to roughly place the floor plan.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!startPoint || !endPoint}
        >
          Confirm
        </Button>
      </Box>
    </Box>
  );
};
