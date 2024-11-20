'use client';

import React, { useState, useEffect } from 'react';
import { useFieldMap } from '../../../../../app/globalHooks/useFieldMap';
import { FloorPlanDialog } from './FloorPlanDialog';
import { ImageOverlay } from './ImageOverlay';
import type { MapRef } from 'react-map-gl';

interface FloorPlanLayerProps {
  /** Reference to the map instance */
  mapRef: React.RefObject<MapRef>;
  /** Currently selected property ID */
  selectedPropertyId?: string;
}

/**
 * FloorPlanLayer handles all floor plan related functionality
 * Features:
 * - Floor plan overlay rendering
 * - Floor plan dialog for adding/editing
 * - Floor plan visibility management
 * 
 * @component
 * @example
 * ```tsx
 * <FloorPlanLayer
 *   mapRef={mapRef}
 *   selectedPropertyId="property-123"
 * />
 * ```
 */
export function FloorPlanLayer({
  mapRef,
  selectedPropertyId
}: FloorPlanLayerProps) {
  const [showFloorPlanDialog, setShowFloorPlanDialog] = useState(false);

  const { 
    selectedProperty,
    floorPlans,
    activeFloorPlan
  } = useFieldMap();

  // Listen for add floor plan event from LayersControl
  useEffect(() => {
    const handleAddFloorPlan = () => {
      console.log('Opening floor plan dialog from event');
      setShowFloorPlanDialog(true);
    };

    document.addEventListener('add-floor-plan', handleAddFloorPlan);
    return () => document.removeEventListener('add-floor-plan', handleAddFloorPlan);
  }, []);

  // Debug floor plan state
  React.useEffect(() => {
    console.log('FloorPlan layer state:', {
      showDialog: showFloorPlanDialog,
      activeFloorPlan,
      floorPlansCount: floorPlans.length
    });
  }, [showFloorPlanDialog, activeFloorPlan, floorPlans]);

  if (!selectedProperty) return null;

  return (
    <>
      {/* Floor plan dialog */}
      {showFloorPlanDialog && selectedPropertyId && (
        <FloorPlanDialog
          open={showFloorPlanDialog}
          onClose={() => {
            console.log('Closing floor plan dialog');
            setShowFloorPlanDialog(false);
          }}
          propertyId={selectedPropertyId}
        />
      )}

      {/* Floor plan overlay */}
      {activeFloorPlan && mapRef.current && selectedProperty.location && (
        <ImageOverlay
          id={activeFloorPlan}
          imageUrl={floorPlans.find(fp => fp.id === activeFloorPlan)?.imageUrl || ''}
          coordinates={[
            [selectedProperty.location.longitude, selectedProperty.location.latitude],
            [selectedProperty.location.longitude, selectedProperty.location.latitude + 0.001],
            [selectedProperty.location.longitude + 0.001, selectedProperty.location.latitude + 0.001],
            [selectedProperty.location.longitude + 0.001, selectedProperty.location.latitude]
          ]}
          opacity={0.75}
          map={mapRef.current.getMap()}
        />
      )}
    </>
  );
}
