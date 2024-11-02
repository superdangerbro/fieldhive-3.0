'use client';

import React, { useState } from 'react';
import { useFieldMapStore } from '../../../../stores/fieldMapStore';
import { FloorControls } from './FloorControls';
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
 * - Floor plan controls
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
const FloorPlanLayer: React.FC<FloorPlanLayerProps> = ({
  mapRef,
  selectedPropertyId
}) => {
  const [showFloorPlanDialog, setShowFloorPlanDialog] = useState(false);
  const [isFloorPlansOpen, setIsFloorPlansOpen] = useState(false);

  const { 
    selectedProperty,
    floorPlans,
    activeFloorPlan
  } = useFieldMapStore();

  // Debug floor plan state
  React.useEffect(() => {
    console.log('FloorPlan layer state:', {
      showDialog: showFloorPlanDialog,
      isOpen: isFloorPlansOpen,
      activeFloorPlan,
      floorPlansCount: floorPlans.length
    });
  }, [showFloorPlanDialog, isFloorPlansOpen, activeFloorPlan, floorPlans]);

  if (!selectedProperty) return null;

  return (
    <>
      {/* Floor plan controls */}
      <FloorControls
        isFloorPlansOpen={isFloorPlansOpen}
        onAddFloorPlan={() => {
          console.log('Opening floor plan dialog');
          setShowFloorPlanDialog(true);
        }}
      />

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
      {activeFloorPlan && mapRef.current && (
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
};

export default FloorPlanLayer;
