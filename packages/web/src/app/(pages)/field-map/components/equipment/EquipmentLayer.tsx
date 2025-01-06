'use client';

import React, { forwardRef, useImperativeHandle, useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { Marker, Popup } from 'react-map-gl';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Crosshairs } from './Crosshairs';
import { AddEquipmentDialog } from './AddEquipmentDialog';
import { EditEquipmentDialog } from './EditEquipmentDialog';
import { EquipmentMarkerDialog } from './EquipmentMarkerDialog';
import { AddInspectionDialog } from './AddInspectionDialog';
import { EquipmentPlacementControls } from './EquipmentPlacementControls';
import { useEquipment } from '../../../../../app/globalHooks/useEquipment';
import { useMapContext } from '../../../../../app/globalHooks/useMapContext';
import type { Equipment, CreateEquipmentDto } from '../../../../../app/globalTypes/equipment';
import type { MapRef } from 'react-map-gl';

interface EquipmentLayerProps {
  /** Whether equipment markers should be visible */
  visible?: boolean;
  /** Current map bounds */
  bounds?: [number, number, number, number];
  /** Reference to the map instance */
  mapRef?: React.RefObject<MapRef>;
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
  mapRef
}, ref) => {
  // Get map context
  const {
    activeJob,
    activeProperty,
    activeMode,
    isAddingEquipment: isAddingFromContext,
    setIsAddingEquipment: setIsAddingFromContext
  } = useMapContext();

  // Equipment data and state management
  const {
    data: equipment,
    addEquipment,
    updateEquipment,
    updateEquipmentStatus,
    isLoading,
    error,
    isPlacingEquipment,
    cancelPlacingEquipment,
    startPlacingEquipment,
    refetch
  } = useEquipment({ bounds });

  useEffect(() => {
    // Removed console.log statement
  }, [equipment]);

  // Local state
  const [isAddEquipmentDialogOpen, setIsAddEquipmentDialogOpen] = useState(false);
  const [isEditEquipmentDialogOpen, setIsEditEquipmentDialogOpen] = useState(false);
  const [isMarkerDialogOpen, setIsMarkerDialogOpen] = useState(false);
  const [isAddInspectionDialogOpen, setIsAddInspectionDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [placementLocation, setPlacementLocation] = useState<[number, number] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMovingEquipment, setIsMovingEquipment] = useState(false);
  const [equipmentToMove, setEquipmentToMove] = useState<Equipment | null>(null);

  // Validate requirements before allowing equipment placement
  const canPlaceEquipment = activeProperty?.property_id && activeJob?.job_id && activeMode === 'edit';

  // Handle isAddingEquipment changes
  useEffect(() => {
    if (isAddingFromContext && canPlaceEquipment) {
      startPlacingEquipment();
    }
  }, [isAddingFromContext, canPlaceEquipment, startPlacingEquipment]);

  // Expose the start placement handler to parent components
  useImperativeHandle(ref, () => ({
    handleStartPlacement: () => {
      // Removed console.log statement
      if (canPlaceEquipment) {
        setIsAddingFromContext(true);
      }
    }
  }));

  // Reset states when dialog closes
  useEffect(() => {
    if (!isAddEquipmentDialogOpen) {
      setPlacementLocation(null);
    }
  }, [isAddEquipmentDialogOpen]);

  const handleStartPlacement = () => {
    setIsAddingFromContext(true);
  };

  const handleCancelPlacement = () => {
    setIsAddingFromContext(false);
    setPlacementLocation(null);
    setIsAddEquipmentDialogOpen(false);
    cancelPlacingEquipment();
  };

  const handleAddEquipment = async (data: any) => {
    try {
      // Add the equipment
      const success = await addEquipment(data);
      if (success) {
        setShowSuccess(true);
      }
      return success;
    } catch (error) {
      // Removed console.error statement
      return false;
    }
  };

  const handleAddAnother = () => {
    // Removed console.log statement
    setShowSuccess(false);
    setIsAddEquipmentDialogOpen(false);
    // Start the placement process again
    setIsAddingFromContext(true);
  };

  const handleCloseDialog = () => {
    // Removed console.log statement
    setIsAddEquipmentDialogOpen(false);
    setIsAddingFromContext(false);
    setShowSuccess(false);
    cancelPlacingEquipment();
  };

  const handleMarkerClick = useCallback((e: React.MouseEvent, equipment: Equipment) => {
    e.originalEvent.stopPropagation();
    setSelectedEquipment(equipment);
    setIsMarkerDialogOpen(true);
  }, []);

  const handleMarkerDialogClose = useCallback(() => {
    setIsMarkerDialogOpen(false);
    setSelectedEquipment(null);
  }, []);

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsEditEquipmentDialogOpen(true);
    setIsMarkerDialogOpen(false);
  };

  const handleUpdateEquipment = async (data: any) => {
    try {
      // Removed console.log statement
      await updateEquipment(data);
      setIsEditEquipmentDialogOpen(false);
      setSelectedEquipment(null);
      return true;
    } catch (error) {
      // Removed console.error statement
      return false;
    }
  };

  const handleAddInspection = useCallback((equipment: Equipment) => {
    // TODO: Implement add inspection functionality
    // Removed console.log statement
    setSelectedEquipment(equipment);
    setIsAddInspectionDialogOpen(true);
    setIsMarkerDialogOpen(false);
  }, []);

  const handleDeleteEquipment = async (id: string) => {
    try {
      await updateEquipmentStatus.mutateAsync({ id, status: 'inactive' });
      setIsMarkerDialogOpen(false);
      setSelectedEquipment(null);
    } catch (error) {
      // Removed console.error statement
      alert('Failed to deactivate equipment. Please try again.');
    }
  };

  const handleUpdateEquipmentType = async (id: string, typeId: string) => {
    try {
      await updateEquipment({ id, data: { equipment_type_id: typeId } });
    } catch (error) {
      // Removed console.error statement
    }
  };

  const handleMoveEquipment = useCallback((equipment: Equipment) => {
    setEquipmentToMove(equipment);
    setIsMovingEquipment(true);
    setIsMarkerDialogOpen(false);
  }, []);

  const handleCancelMove = useCallback(() => {
    setIsMovingEquipment(false);
    setEquipmentToMove(null);
  }, []);

  const handleConfirmMove = useCallback(async (location: [number, number]) => {
    if (!equipmentToMove?.equipment_id) return;
    
    try {
      await updateEquipment({
        equipment_id: equipmentToMove.equipment_id,
        location: {
          latitude: location[1],
          longitude: location[0]
        }
      });
      setIsMovingEquipment(false);
      setEquipmentToMove(null);
    } catch (error) {
      // Removed console.error statement
    }
  }, [equipmentToMove, updateEquipment]);

  if (!visible) return null;

  return (
    <>
      {/* Equipment markers */}
      {Array.isArray(equipment) && equipment.length > 0 && equipment.map((eq) => {
        if (!eq) return null;

        // Safely extract coordinates
        const longitude = eq.location?.coordinates?.[0] ?? eq.location?.longitude;
        const latitude = eq.location?.coordinates?.[1] ?? eq.location?.latitude;

        // Skip if coordinates are invalid
        if (!longitude || !latitude || isNaN(longitude) || isNaN(latitude)) {
          // Removed console.warn statement
          return null;
        }

        return (
          <Marker
            key={eq.equipment_id}
            longitude={longitude}
            latitude={latitude}
            onClick={(e) => handleMarkerClick(e, eq)}
          >
            <Tooltip 
              title={
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {eq.type || 'Equipment'}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Job: {eq.job?.title || 'N/A'}
                  </Typography>
                </Box>
              }
              arrow 
              placement="top"
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  border: '2px solid white',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.2)',
                  },
                }}
              />
            </Tooltip>
          </Marker>
        );
      })}

      {/* Add Equipment Dialog */}
      <AddEquipmentDialog
        open={isAddEquipmentDialogOpen}
        location={placementLocation || [0, 0]}
        onClose={handleCloseDialog}
        onSubmit={handleAddEquipment}
        onAddAnother={handleAddAnother}
        showSuccess={showSuccess}
        propertyName={activeProperty?.name || ''}
        propertyType={activeProperty?.type || ''}
        jobType={activeJob?.job_type_id || ''}
        jobTitle={activeJob?.title}
        accounts={activeJob?.accounts}
      />

      {/* Edit Equipment Dialog */}
      {selectedEquipment && (
        <EditEquipmentDialog
          open={isEditEquipmentDialogOpen}
          equipment={selectedEquipment}
          onClose={() => {
            setIsEditEquipmentDialogOpen(false);
            setSelectedEquipment(null);
          }}
          onSubmit={handleUpdateEquipment}
        />
      )}

      {/* Equipment Marker Dialog */}
      {selectedEquipment && (
        <EquipmentMarkerDialog
          equipment={selectedEquipment}
          open={isMarkerDialogOpen}
          onClose={handleMarkerDialogClose}
          onDelete={handleDeleteEquipment}
          onUpdateType={handleUpdateEquipmentType}
          onEdit={handleEditEquipment}
          onAddInspection={handleAddInspection}
          onMove={handleMoveEquipment}
        />
      )}

      {/* Add Inspection Dialog */}
      {selectedEquipment && (
        <AddInspectionDialog
          open={isAddInspectionDialogOpen}
          equipment={selectedEquipment}
          onClose={() => {
            setIsAddInspectionDialogOpen(false);
            setSelectedEquipment(null);
          }}
          onSuccess={() => {
            // Refetch equipment data
            refetch();
          }}
        />
      )}

      {/* Moving Equipment UI */}
      {isMovingEquipment && (
        <>
          <Crosshairs />
          <EquipmentPlacementControls
            onCancel={handleCancelMove}
            onConfirm={() => {
              const center = mapRef?.current?.getCenter();
              if (center) {
                handleConfirmMove([center.lng, center.lat]);
              }
            }}
            mode="move"
          />
        </>
      )}

      {/* Crosshairs for equipment placement */}
      {isAddingFromContext && !isAddEquipmentDialogOpen && mapRef?.current && (
        <>
          <Crosshairs mapRef={mapRef} />
          <EquipmentPlacementControls
            onConfirm={() => {
              const center = mapRef.current?.getCenter();
              if (!center) {
                // Removed console.warn statement
                return;
              }
              
              const lng = center.lng;
              const lat = center.lat;
              
              if (!lng || !lat || isNaN(lng) || isNaN(lat)) {
                // Removed console.warn statement
                return;
              }

              // Removed console.log statement
              setPlacementLocation([lng, lat]);
              setIsAddEquipmentDialogOpen(true);
            }}
            onCancel={() => {
              handleCancelPlacement();
              setIsAddingFromContext(false);
            }}
          />
        </>
      )}
    </>
  );
});

EquipmentLayer.displayName = 'EquipmentLayer';
