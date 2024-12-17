'use client';

import React, { forwardRef, useImperativeHandle } from 'react';
import { Box } from '@mui/material';
import { Marker } from 'react-map-gl';
import { Crosshairs } from './Crosshairs';
import { AddEquipmentDialog } from './AddEquipmentDialog';
import { EquipmentMarkerDialog } from './EquipmentMarkerDialog';
import { useEquipment } from '../../../../../app/globalHooks/useEquipment';
import { useMapContext } from '../../../../../app/globalHooks/useMapContext';
import type { Equipment, CreateEquipmentDto } from '../../../../../app/globalTypes/equipment';

interface EquipmentLayerProps {
  /** Whether equipment markers should be visible */
  visible?: boolean;
  /** Current map bounds */
  bounds?: [number, number, number, number];
}

export interface EquipmentLayerHandle {
  handleStartPlacement: () => void;
}

/**
 * Map-specific equipment layer that handles equipment visualization and interaction
 * Features:
 * - Equipment marker rendering
 * - Equipment placement mode
 * - Add/Edit equipment dialogs
 * - Equipment visibility toggle
 */
export const EquipmentLayer = forwardRef<EquipmentLayerHandle, EquipmentLayerProps>(({
  visible = false,
  bounds,
}, ref) => {
  // Get map context
  const {
    activeJob,
    activeProperty,
    activeMode,
    isAddingEquipment,
    setIsAddingEquipment
  } = useMapContext();

  // Equipment data and state management
  const {
    equipment = [],  // Provide default empty array
    addEquipment,
    updateEquipment,
    deleteEquipment,
    isLoading,
    isPlacingEquipment,
    placementLocation,
    isAddEquipmentDialogOpen,
    isMarkerDialogOpen,
    selectedEquipment,
    startPlacingEquipment,
    cancelPlacingEquipment,
    setPlacementLocation,
    confirmPlacementLocation,
    openMarkerDialog,
    closeMarkerDialog
  } = useEquipment({ bounds });

  // Validate requirements before allowing equipment placement
  const canPlaceEquipment = activeProperty?.property_id && activeJob?.job_id && activeMode === 'edit';

  // Expose the start placement handler to parent components
  useImperativeHandle(ref, () => ({
    handleStartPlacement: () => {
      if (!canPlaceEquipment) {
        console.warn('Cannot place equipment: Property and job must be selected');
        return;
      }
      setIsAddingEquipment(true);
      startPlacingEquipment();
    }
  }));

  if (!visible) return null;

  return (
    <>
      {/* Equipment Markers */}
      {Array.isArray(equipment) && equipment.map((eq: Equipment) => {
        if (!eq?.location?.coordinates) return null;
        const [longitude, latitude] = eq.location.coordinates;

        return (
          <Marker
            key={eq.equipment_id}
            longitude={longitude}
            latitude={latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              openMarkerDialog(eq);
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 24,
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: 2,
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}
            />
          </Marker>
        );
      })}

      {/* Equipment placement crosshair */}
      {isPlacingEquipment && canPlaceEquipment && (
        <Crosshairs onLocationConfirmed={(location) => {
          setPlacementLocation(location);
          confirmPlacementLocation();
        }} />
      )}

      {/* Add equipment dialog */}
      {isAddEquipmentDialogOpen && placementLocation && canPlaceEquipment && activeProperty?.property_id && activeJob?.job_id && (
        <AddEquipmentDialog
          open={isAddEquipmentDialogOpen}
          location={placementLocation}
          onClose={() => {
            cancelPlacingEquipment();
            setIsAddingEquipment(false);
          }}
          onSubmit={async (data) => {
            const equipmentData: CreateEquipmentDto = {
              ...data,
              property_id: activeProperty.property_id,
              job_id: activeJob.job_id,
              location: {
                coordinates: placementLocation
              }
            };
            await addEquipment.mutateAsync(equipmentData);
            setIsAddingEquipment(false);
          }}
        />
      )}

      {/* Equipment marker dialog */}
      {isMarkerDialogOpen && selectedEquipment && (
        <EquipmentMarkerDialog
          open={isMarkerDialogOpen}
          equipment={selectedEquipment}
          onClose={closeMarkerDialog}
          onDelete={async (id) => deleteEquipment.mutateAsync(id)}
          onUpdateType={async (id, typeId) => 
            updateEquipment.mutateAsync({ 
              id, 
              data: { type: typeId } 
            })
          }
        />
      )}
    </>
  );
});

EquipmentLayer.displayName = 'EquipmentLayer';
