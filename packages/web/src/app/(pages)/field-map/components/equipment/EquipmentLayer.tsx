'use client';

import React from 'react';
import { Box, Fab, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Crosshairs } from './Crosshairs';
import { AddEquipmentDialog } from './AddEquipmentDialog';
import { EquipmentMarkerDialog } from './EquipmentMarkerDialog';
import { useEquipment } from '@/app/globalHooks/useEquipment';
import type { Equipment } from '@/app/globalTypes/equipment';

interface EquipmentLayerProps {
  /** Whether equipment markers should be visible */
  visible?: boolean;
  /** The currently selected property ID */
  selectedPropertyId?: string;
  /** Current map bounds */
  bounds?: [number, number, number, number];
}

/**
 * Map-specific equipment layer that handles equipment visualization and interaction
 * Features:
 * - Equipment marker rendering
 * - Equipment placement mode
 * - Add/Edit equipment dialogs
 * - Equipment visibility toggle
 */
export function EquipmentLayer({
  visible = false,
  selectedPropertyId,
  bounds
}: EquipmentLayerProps) {
  const theme = useTheme();

  // Equipment data and state management
  const {
    equipment,
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

  if (!visible) return null;

  return (
    <>
      {/* Equipment placement crosshair */}
      {isPlacingEquipment && (
        <Crosshairs onLocationConfirmed={(location) => {
          setPlacementLocation(location);
          confirmPlacementLocation();
        }} />
      )}

      {/* Add equipment button */}
      {!isPlacingEquipment && selectedPropertyId && (
        <Fab
          color="primary"
          onClick={startPlacingEquipment}
          sx={{
            position: 'absolute',
            bottom: 32,
            right: 32,
            zIndex: 1000,
            width: 72,
            height: 72,
          }}
        >
          <AddIcon sx={{ fontSize: 36 }} />
        </Fab>
      )}

      {/* Add equipment dialog */}
      {isAddEquipmentDialogOpen && placementLocation && (
        <AddEquipmentDialog
          open={isAddEquipmentDialogOpen}
          location={placementLocation}
          onClose={cancelPlacingEquipment}
          onSubmit={async (data) => {
            if (!placementLocation) return;
            return addEquipment.mutateAsync({
              ...data,
              location: {
                coordinates: placementLocation
              }
            });
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
}
