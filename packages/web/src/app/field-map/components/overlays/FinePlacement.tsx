'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Slider, Typography } from '@mui/material';
import mapboxgl from 'mapbox-gl';

interface FinePlacementProps {
  /** Mapbox map instance */
  map: mapboxgl.Map;
  /** Initial bounds for the floor plan */
  initialBounds: {
    west: number;
    east: number;
    north: number;
    south: number;
    coordinates: [number, number][];
  };
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
 * Component for fine-tuning floor plan placement
 * Features:
 * - Rotation control
 * - Scale control
 * - Visual preview
 * - Coordinate transformation
 * 
 * @component
 * @example
 * ```tsx
 * <FinePlacement
 *   map={mapInstance}
 *   initialBounds={bounds}
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 * ```
 */
export const FinePlacement: React.FC<FinePlacementProps> = ({
  map,
  initialBounds,
  onConfirm,
  onCancel,
}) => {
  const [bounds, setBounds] = useState(initialBounds);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const boxRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.remove();
    }

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
      .setLngLat(new mapboxgl.LngLat((bounds.west + bounds.east) / 2, (bounds.north + bounds.south) / 2))
      .addTo(map);

    updateBox();
  }, [map, bounds]);

  const updateBox = () => {
    if (boxRef.current) {
      const el = boxRef.current.getElement();
      const center = new mapboxgl.LngLat((bounds.west + bounds.east) / 2, (bounds.north + bounds.south) / 2);
      const { x, y } = map.project(center);
      const { x: x1, y: y1 } = map.project(new mapboxgl.LngLat(bounds.west, bounds.south));
      const { x: x2, y: y2 } = map.project(new mapboxgl.LngLat(bounds.east, bounds.north));

      const width = Math.abs(x2 - x1) * scale;
      const height = Math.abs(y2 - y1) * scale;

      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      el.style.transform = `translate(${-width / 2}px, ${-height / 2}px) rotate(${rotation}deg)`;
    }
  };

  const handleRotationChange = (event: Event, newValue: number | number[]) => {
    setRotation(newValue as number);
    updateBox();
  };

  const handleScaleChange = (event: Event, newValue: number | number[]) => {
    setScale(newValue as number);
    updateBox();
  };

  const handleConfirm = () => {
    const center = new mapboxgl.LngLat((bounds.west + bounds.east) / 2, (bounds.north + bounds.south) / 2);
    const width = (bounds.east - bounds.west) * scale;
    const height = (bounds.north - bounds.south) * scale;

    const rotatedCoordinates = bounds.coordinates.map(([lng, lat]) => {
      const point = new mapboxgl.Point(lng - center.lng, lat - center.lat);
      const rotatedPoint = point.rotate(-rotation * (Math.PI / 180));
      return [
        rotatedPoint.x * scale + center.lng,
        rotatedPoint.y * scale + center.lat,
      ] as [number, number];
    });

    const newBounds = new mapboxgl.LngLatBounds();
    rotatedCoordinates.forEach(coord => newBounds.extend(coord));

    onConfirm({
      west: newBounds.getWest(),
      east: newBounds.getEast(),
      north: newBounds.getNorth(),
      south: newBounds.getSouth(),
      coordinates: rotatedCoordinates,
    });
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
        width: 300,
      }}
    >
      <Typography variant="body1" gutterBottom>
        Fine-tune the floor plan placement
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography id="rotation-slider" gutterBottom>
          Rotation
        </Typography>
        <Slider
          aria-labelledby="rotation-slider"
          value={rotation}
          onChange={handleRotationChange}
          min={-180}
          max={180}
          step={1}
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography id="scale-slider" gutterBottom>
          Scale
        </Typography>
        <Slider
          aria-labelledby="scale-slider"
          value={scale}
          onChange={handleScaleChange}
          min={0.5}
          max={2}
          step={0.1}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleConfirm}>
          Confirm
        </Button>
      </Box>
    </Box>
  );
};
