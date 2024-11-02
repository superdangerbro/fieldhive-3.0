'use client';

import React, { useCallback, useEffect } from 'react';
import { Box, Fab, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useMapEquipmentStore } from '../../stores/mapEquipmentStore';
import { useEquipmentStore } from '../../../equipment/stores/equipmentStore';
import { Crosshairs } from './Crosshairs';
import { AddEquipmentDialog } from './AddEquipmentDialog';
import { EquipmentMarkerDialog } from './EquipmentMarkerDialog';
import type { Equipment } from '../../../equipment/types';

interface EquipmentLayerProps {
  /** Whether equipment markers should be visible */
  visible?: boolean;
  /** The currently selected property ID */
  selectedPropertyId?: string;
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
  selectedPropertyId
}: EquipmentLayerProps) {
  const theme = useTheme();

  const {
    isPlacingEquipment,
    isAddEquipmentDialogOpen,
    isMarkerDialogOpen,
    placementLocation,
    startPlacingEquipment,
    closeAddEquipmentDialog,
    closeMarkerDialog,
    getEquipmentInBounds
  } = useMapEquipmentStore();

  const {
    selectedEquipment,
    addEquipment,
    deleteEquipment,
    updateEquipmentType
  } = useEquipmentStore();

  // Debug equipment state changes
  useEffect(() => {
    console.log('Equipment layer state:', {
      visible,
      isPlacingEquipment,
      isAddEquipmentDialogOpen,
      selectedEquipment: selectedEquipment?.equipment_id
    });
  }, [visible, isPlacingEquipment, isAddEquipmentDialogOpen, selectedEquipment]);

  /**
   * Handle equipment placement initiation
   */
  const handleStartPlacement = useCallback(() => {
    console.log('Starting equipment placement');
    startPlacingEquipment();
  }, [startPlacingEquipment]);

  /**
   * Handle new equipment submission
   */
  const handleSubmitEquipment = useCallback(async (data: {
    equipment_type_id: string;
    status: string;
    data: Record<string, any>;
  }) => {
    if (!placementLocation) return;

    console.log('Submitting new equipment:', data);
    await addEquipment({
      ...data,
      location: {
        type: 'Point',
        coordinates: placementLocation
      }
    });
    closeAddEquipmentDialog();
  }, [addEquipment, placementLocation, closeAddEquipmentDialog]);

  /**
   * Handle equipment deletion
   */
  const handleDeleteEquipment = useCallback(async (equipmentId: string) => {
    console.log('Deleting equipment:', equipmentId);
    await deleteEquipment(equipmentId);
    closeMarkerDialog();
  }, [deleteEquipment, closeMarkerDialog]);

  /**
   * Handle equipment type update
   */
  const handleUpdateType = useCallback(async (equipmentId: string, equipmentTypeId: string) => {
    console.log('Updating equipment type:', { equipmentId, equipmentTypeId });
    await updateEquipmentType(equipmentId, equipmentTypeId);
  }, [updateEquipmentType]);

  if (!visible) return null;

  return (
    <>
      {/* Equipment placement crosshair */}
      {isPlacingEquipment && <Crosshairs />}

      {/* Add equipment button */}
      {!isPlacingEquipment && selectedPropertyId && (
        <Fab
          color="primary"
          onClick={handleStartPlacement}
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
          onClose={closeAddEquipmentDialog}
          onSubmit={handleSubmitEquipment}
        />
      )}

      {/* Equipment marker dialog */}
      {isMarkerDialogOpen && selectedEquipment && (
        <EquipmentMarkerDialog
          open={isMarkerDialogOpen}
          equipment={selectedEquipment}
          onClose={closeMarkerDialog}
          onDelete={() => handleDeleteEquipment(selectedEquipment.equipment_id)}
          onUpdateType={(typeId: string) => handleUpdateType(selectedEquipment.equipment_id, typeId)}
        />
      )}
    </>
  );
}
