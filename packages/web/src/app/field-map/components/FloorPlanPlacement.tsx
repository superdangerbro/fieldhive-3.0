'use client';

import React, { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { RoughPlacement } from './RoughPlacement';
import { FinePlacement } from './FinePlacement';

interface FloorPlanPlacementProps {
  map: mapboxgl.Map;
  onCancel: () => void;
  onConfirm: (bounds: {
    west: number;
    east: number;
    north: number;
    south: number;
    coordinates: [number, number][];
  }) => void;
}

export const FloorPlanPlacement: React.FC<FloorPlanPlacementProps> = ({
  map,
  onCancel,
  onConfirm,
}) => {
  const [placementStage, setPlacementStage] = useState<'rough' | 'fine'>('rough');
  const [roughBounds, setRoughBounds] = useState<{
    west: number;
    east: number;
    north: number;
    south: number;
    coordinates: [number, number][];
  } | null>(null);

  const handleRoughPlacementConfirm = (bounds: {
    west: number;
    east: number;
    north: number;
    south: number;
    coordinates: [number, number][];
  }) => {
    setRoughBounds(bounds);
    setPlacementStage('fine');
  };

  const handleFinePlacementConfirm = (bounds: {
    west: number;
    east: number;
    north: number;
    south: number;
    coordinates: [number, number][];
  }) => {
    onConfirm(bounds);
  };

  const handleCancel = () => {
    if (placementStage === 'fine') {
      setPlacementStage('rough');
    } else {
      onCancel();
    }
  };

  return (
    <>
      {placementStage === 'rough' && (
        <RoughPlacement
          map={map}
          onConfirm={handleRoughPlacementConfirm}
          onCancel={onCancel}
        />
      )}
      {placementStage === 'fine' && roughBounds && (
        <FinePlacement
          map={map}
          initialBounds={roughBounds}
          onConfirm={handleFinePlacementConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};
