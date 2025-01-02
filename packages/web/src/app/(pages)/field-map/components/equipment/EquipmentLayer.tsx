'use client';

import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Marker } from 'react-map-gl';
import { Crosshairs } from './Crosshairs';
import { AddEquipmentDialog } from './AddEquipmentDialog';
import { EquipmentMarkerDialog } from './EquipmentMarkerDialog';
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
    isAddingEquipment,
    setIsAddingEquipment
  } = useMapContext();

  // Equipment data and state management
  const {
    equipment,
    isLoading,
    error,
    isPlacingEquipment,
    isMarkerDialogOpen,
    selectedEquipment,
    addEquipment,
    deleteEquipment,
    updateEquipment,
    cancelPlacingEquipment,
    startPlacingEquipment
  } = useEquipment({ bounds });

  // Validate requirements before allowing equipment placement
  const canPlaceEquipment = activeProperty?.property_id && activeJob?.job_id && activeMode === 'edit';

  // Handle isAddingEquipment changes
  useEffect(() => {
    if (isAddingEquipment && canPlaceEquipment) {
      startPlacingEquipment();
    }
  }, [isAddingEquipment, canPlaceEquipment, startPlacingEquipment]);

  // Expose the start placement handler to parent components
  useImperativeHandle(ref, () => ({
    handleStartPlacement: () => {
      console.log('Starting equipment placement with:', {
        canPlaceEquipment,
        activeProperty,
        activeJob,
        activeMode
      });
      if (canPlaceEquipment) {
        setIsAddingEquipment(true);
      }
    }
  }));

  const [isAddEquipmentDialogOpen, setIsAddEquipmentDialogOpen] = useState(false);
  const [placementLocation, setPlacementLocation] = useState<[number, number] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset states when dialog closes
  useEffect(() => {
    if (!isAddEquipmentDialogOpen) {
      setShowSuccess(false);
    }
  }, [isAddEquipmentDialogOpen]);

  const handleAddEquipment = async (data: any) => {
    try {
      const equipmentData = {
        job_id: activeJob.job_id,
        equipment_type_id: data.equipment_type_id,
        status: data.status || 'active',
        location: data.location,
        is_georeferenced: data.is_georeferenced,
        property_id: activeProperty.property_id,
        property_name: activeProperty.name,
        property_type: activeProperty.type,
        job_title: activeJob.title || 'None',
        job_type: activeJob.type,
        accounts: activeProperty.accounts?.map(account => account.name) || [],
        data: data.data
      };
      console.log('Submitting equipment:', equipmentData);
      const result = await addEquipment.mutateAsync(equipmentData);
      console.log('Equipment added successfully:', result);
      setShowSuccess(true);
      return true;
    } catch (error) {
      console.error('Failed to add equipment:', error);
      throw error;
    }
  };

  const handleCloseDialog = () => {
    console.log('Closing dialog');
    setIsAddEquipmentDialogOpen(false);
    setIsAddingEquipment(false);
    setShowSuccess(false);
    cancelPlacingEquipment();
  };

  const handleAddAnother = () => {
    console.log('Adding another');
    setShowSuccess(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Equipment Markers */}
      {Array.isArray(equipment) && equipment.map((eq: Equipment) => {
        if (!eq?.location?.coordinates) {
          console.log('Equipment missing coordinates:', eq);
          return null;
        }
        const [longitude, latitude] = eq.location.coordinates;
        console.log('Rendering equipment marker:', eq.equipment_id, longitude, latitude);

        return (
          <Marker
            key={eq.equipment_id}
            longitude={longitude}
            latitude={latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              // openMarkerDialog(eq);
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
        <>
          <Crosshairs onLocationConfirmed={(location) => {
            setPlacementLocation(location);
            setIsAddEquipmentDialogOpen(true);
          }} />
          <EquipmentPlacementControls
            onConfirm={() => {
              const mapInstance = mapRef?.current?.getMap();
              if (!mapInstance) return;
              
              const center = mapInstance.getCenter();
              setPlacementLocation([center.lng, center.lat]);
              setIsAddEquipmentDialogOpen(true);
            }}
            onCancel={() => {
              cancelPlacingEquipment();
              setIsAddingEquipment(false);
            }}
          />
        </>
      )}

      {/* Add equipment dialog */}
      {isAddEquipmentDialogOpen && placementLocation && canPlaceEquipment && activeProperty?.property_id && activeJob?.job_id && (
        <AddEquipmentDialog
          open={isAddEquipmentDialogOpen}
          location={placementLocation}
          propertyName={activeProperty.name}
          propertyType={activeProperty.type}
          jobType={activeJob.type || 'None'}
          jobTitle={activeJob.title}
          accounts={activeProperty.accounts?.map(account => account.name) || []}
          showSuccess={showSuccess}
          onClose={handleCloseDialog}
          onAddAnother={handleAddAnother}
          onSubmit={handleAddEquipment}
        />
      )}

      {/* Equipment marker dialog */}
      {isMarkerDialogOpen && selectedEquipment && (
        <EquipmentMarkerDialog
          open={isMarkerDialogOpen}
          equipment={selectedEquipment}
          onClose={() => {
            // closeMarkerDialog();
          }}
          onDelete={async (id) => {
            console.log('Deleting equipment:', id);
            try {
              await deleteEquipment.mutateAsync(id);
              console.log('Successfully deleted equipment');
            } catch (error) {
              console.error('Failed to delete equipment:', error);
              throw error; // Re-throw to be handled by the dialog
            }
          }}
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
