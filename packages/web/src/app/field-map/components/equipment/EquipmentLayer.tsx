'use client';

import React, { useCallback, useEffect } from 'react';
import { Box, Fab, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEquipmentStore } from '../../../../stores/equipmentStore';
import { Crosshairs } from './Crosshairs';
import { AddEquipmentDialog } from './AddEquipmentDialog';
import { EquipmentMarkerDialog } from './EquipmentMarkerDialog';

// Import types from the store
interface Equipment {
  equipment_id: string;
  equipment_type_id: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  equipment_type: {
    name: string;
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      options?: string[];
      numberConfig?: {
        min?: number;
        max?: number;
        step?: number;
      };
      showWhen?: Array<{
        field: string;
        value: any;
        makeRequired?: boolean;
      }>;
    }>;
  };
}

interface EquipmentLayerProps {
  /** Whether equipment markers should be visible */
  visible?: boolean;
  /** The currently selected property ID */
  selectedPropertyId?: string;
}

/**
 * EquipmentLayer handles all equipment-related functionality on the map
 * Features:
 * - Equipment marker rendering
 * - Equipment placement mode
 * - Add/Edit equipment dialogs
 * - Equipment visibility toggle
 * 
 * @component
 * @example
 * ```tsx
 * <EquipmentLayer
 *   visible={true}
 *   selectedPropertyId="property-123"
 * />
 * ```
 */
const EquipmentLayer: React.FC<EquipmentLayerProps> = ({
  visible = false,
  selectedPropertyId
}) => {
  const theme = useTheme();

  const {
    isPlacingEquipment,
    isAddEquipmentDialogOpen,
    isMarkerDialogOpen,
    placementLocation,
    selectedEquipment,
    startPlacingEquipment,
    closeAddEquipmentDialog,
    submitNewEquipment,
    closeMarkerDialog,
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
    console.log('Submitting new equipment:', data);
    await submitNewEquipment(data);
  }, [submitNewEquipment]);

  /**
   * Handle equipment deletion
   */
  const handleDeleteEquipment = useCallback(async (equipmentId: string) => {
    console.log('Deleting equipment:', equipmentId);
    await deleteEquipment(equipmentId);
  }, [deleteEquipment]);

  /**
   * Handle equipment type update
   */
  const handleUpdateType = useCallback(async (equipmentId: string, typeId: string) => {
    console.log('Updating equipment type:', { equipmentId, typeId });
    await updateEquipmentType(equipmentId, typeId);
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
          onUpdateType={(typeId) => handleUpdateType(selectedEquipment.equipment_id, typeId)}
        />
      )}
    </>
  );
};

export default EquipmentLayer;
