'use client';

import React, { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { RoughPlacement } from './RoughPlacement';
import { FinePlacement } from './FinePlacement';
import type { FloorPlanBounds } from '../../types';

interface FloorPlanPlacementProps {
  /** Mapbox map instance */
  map: mapboxgl.Map;
  /** Handler for canceling placement */
  onCancel: () => void;
  /** Handler for confirming final placement */
  onConfirm: (bounds: FloorPlanBounds) => void;
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
export function FloorPlanPlacement({
  map,
  onCancel,
  onConfirm,
}: FloorPlanPlacementProps) {
  const [placementStage, setPlacementStage] = useState<'rough' | 'fine'>('rough');
  const [roughBounds, setRoughBounds] = useState<FloorPlanBounds | null>(null);

  const handleRoughPlacementConfirm = (bounds: FloorPlanBounds) => {
    setRoughBounds(bounds);
    setPlacementStage('fine');
  };

  const handleFinePlacementConfirm = (bounds: FloorPlanBounds) => {
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
}
