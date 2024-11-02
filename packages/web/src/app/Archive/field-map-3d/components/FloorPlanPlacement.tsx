'use client';

import React, { useState } from 'react';
import { RoughPlacement } from './RoughPlacement';
import { FinePlacement } from './FinePlacement';
import mapboxgl from 'mapbox-gl';

interface FloorPlanPlacementProps {
  onCancel: () => void;
  onConfirm: (bounds: {
    west: number;
    east: number;
    north: number;
    south: number;
    coordinates: [number, number][];
  }) => void;
  map: mapboxgl.Map;
}

type PlacementStage = 'rough' | 'fine';

export function FloorPlanPlacement({ onCancel, onConfirm, map }: FloorPlanPlacementProps) {
  const [stage, setStage] = useState<PlacementStage>('rough');
  const [roughMarkers, setRoughMarkers] = useState<[number, number][]>([]);

  const handleRoughComplete = (markers: [number, number][]) => {
    setRoughMarkers(markers);
    setStage('fine');
  };

  const handleBackToRough = () => {
    setStage('rough');
  };

  return (
    <>
      {stage === 'rough' && (
        <RoughPlacement
          map={map}
          onCancel={onCancel}
          onContinue={handleRoughComplete}
        />
      )}

      {stage === 'fine' && (
        <FinePlacement
          map={map}
          initialMarkers={roughMarkers}
          onCancel={handleBackToRough}
          onConfirm={onConfirm}
        />
      )}
    </>
  );
}
