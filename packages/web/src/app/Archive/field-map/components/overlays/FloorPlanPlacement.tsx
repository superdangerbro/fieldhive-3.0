'use client';

import React, { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { RoughPlacement } from './RoughPlacement';
import { FinePlacement } from './FinePlacement';

interface FloorPlanPlacementProps {
  /** Mapbox map instance */
  map: mapboxgl.Map;
  /** Handler for canceling placement */
  onCancel: () => void;
  /** Handler for confirming final placement */
  onConfirm: (bounds: {
    west: number;
    east: number;
    north: number;
    south: number;
    coordinates: [number, number][];
  }) => void;
}

/**
 * Coordinates the floor plan placement workflow
 * Features:
 * - Two-stage placement process (rough -> fine)
 * - State management between stages
 * - Cancellation handling
 * 
 * Flow:
 * 1. RoughPlacement: Click and drag to define initial bounds
 * 2. FinePlacement: Fine-tune position, rotation, and scale
 * 
 * @component
 * @example
 * ```tsx
 * <FloorPlanPlacement
 *   map={mapInstance}
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 * ```
 */
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
