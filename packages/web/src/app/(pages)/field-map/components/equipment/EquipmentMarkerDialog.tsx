'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useEquipment } from '@/app/(pages)/settings/equipment/hooks/useEquipment';
import type { Equipment, Field, EquipmentStatus, EquipmentType } from '@/app/globalTypes/equipment';

// Helper function to format address
const formatAddress = (address: any) => {
  if (!address) return null;
  const parts = [
    address.address1,
    address.address2,
    address.city,
    address.province,
    address.postal_code,
    address.country
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
};

// Status chip component that maps status to color
const StatusChip = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-[#22c55e]';
      case 'inactive':
        return 'bg-[#ef4444]';
      case 'pending':
        return 'bg-[#f59e0b]';
      default:
        return 'bg-[#6b7280]';
    }
  };

  return (
    <span className={`inline-block text-sm px-3 py-1 rounded-full text-white font-medium capitalize ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

interface EquipmentMarkerDialogProps {
  equipment: Equipment;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onUpdateType: (id: string, typeId: string) => Promise<void>;
  onEdit?: (equipment: Equipment) => void;
  onAddInspection?: (equipment: Equipment) => void;
  onMove?: (equipment: Equipment) => void;
}

/**
 * Dialog for displaying and managing equipment details
 * Features:
 * - Equipment information display
 * - Status indication
 * - Field value display
 * - Equipment deletion
 * - Type updates
 */
export function EquipmentMarkerDialog({
  equipment,
  open,
  onClose,
  onDelete,
  onUpdateType,
  onEdit,
  onAddInspection,
  onMove
}: EquipmentMarkerDialogProps) {
  const { equipmentTypes, equipmentStatuses, updateEquipmentStatus } = useEquipment();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!equipment?.equipment_id) {
      console.error('No equipment ID found');
      return;
    }

    if (window.confirm('Are you sure you want to deactivate this equipment? This will hide it from the map.')) {
      try {
        setIsDeleting(true);
        await updateEquipmentStatus.mutateAsync({ 
          id: equipment.equipment_id, 
          status: 'inactive' 
        });
        onClose();
      } catch (error) {
        console.error('Failed to deactivate equipment:', error);
        alert(error instanceof Error ? error.message : 'Failed to deactivate equipment. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  /**
   * Get formatted field value based on field type
   */
  const getFieldValue = (field: Field) => {
    const value = equipment.data?.[field.name];
    
    switch (field.type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'select':
        return value || 'Not set';
      case 'number-input':
      case 'number-stepper':
      case 'slider':
        return value?.toString() || 'Not set';
      default:
        return value || 'Not set';
    }
  };

  // Find the status configuration for the current equipment status
  const statusConfig = equipmentStatuses.find((status: EquipmentStatus) => status.name === equipment.status);

  // Find the type configuration for the current equipment
  const typeConfig = equipmentTypes.find((type: EquipmentType) => type.name === equipment.type);

  console.log('Equipment data in dialog:', {
    equipment,
    data: equipment.data,
    location: equipment.location,
    type: equipment.type,
    status: equipment.status
  });

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle>
        Equipment Details
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className="flex flex-col gap-16 p-8">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-white">General Information</h3>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => onEdit?.(equipment)}
            >
              Edit Equipment
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => onMove?.(equipment)}
            >
              Move Equipment
            </Button>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3" style={{lineHeight: '2rem'}}>
              <span className="text-sm font-semibold text-purple-400 min-w-[140px]">Type: </span>
              <span className="text-sm text-white">{equipment.type || '-'}</span>
            </div>
            <div className="flex items-center gap-3" style={{lineHeight: '2rem'}}>
              <span className="text-sm font-semibold text-purple-400 min-w-[140px]">Status: </span>
              <span style={{
                backgroundColor: equipment.status === 'active' ? '#22c55e' : 
                               equipment.status === 'inactive' ? '#ef4444' : 
                               equipment.status === 'pending' ? '#f59e0b' : '#6b7280',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}>
                {equipment.status}
              </span>
            </div>
            <div className="flex items-center gap-3" style={{lineHeight: '2rem'}}>
              <span className="text-sm font-semibold text-purple-400 min-w-[140px]">ID: </span>
              <span className="text-sm font-mono text-white">{equipment.equipment_id}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <h3 className="text-base font-semibold text-white">Job Details</h3>
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3" style={{lineHeight: '2rem'}}>
              <span className="text-sm font-semibold text-purple-400 min-w-[140px]">Property: </span>
              <span className="text-sm text-white">{equipment.job?.property?.name || '-'}</span>
            </div>
            <div className="flex items-start gap-3" style={{lineHeight: '2rem'}}>
              <span className="text-sm font-semibold text-purple-400 min-w-[140px]">Property Type: </span>
              <span className="text-sm text-white">{equipment.job?.property?.type || '-'}</span>
            </div>
            <div className="flex items-start gap-3" style={{lineHeight: '2rem'}}>
              <span className="text-sm font-semibold text-purple-400 min-w-[140px]">Job: </span>
              <span className="text-sm text-white">{equipment.job?.title || '-'}</span>
            </div>
            <div className="flex items-start gap-3" style={{lineHeight: '2rem'}}>
              <span className="text-sm font-semibold text-purple-400 min-w-[140px]">Job Type: </span>
              <span className="text-sm text-white">{equipment.job?.job_type_id || '-'}</span>
            </div>
            <div className="flex items-start gap-3" style={{lineHeight: '2rem'}}>
              <span className="text-sm font-semibold text-purple-400 min-w-[140px]">Address: </span>
              <span className="text-sm text-white">
                {(equipment.job?.serviceAddress?.formatted_address || 
                  equipment.job?.property?.serviceAddress?.formatted_address || 
                  formatAddress(equipment.job?.serviceAddress) || 
                  formatAddress(equipment.job?.property?.serviceAddress)) || '-'}</span>
            </div>
          </div>
        </div>

        {/* Equipment Fields */}
        {typeConfig?.fields && (
          <div className="flex flex-col gap-8">
            <h3 className="text-base font-semibold text-white">Equipment Details</h3>
            <div className="flex flex-col gap-6">
              {typeConfig.fields.map((field: Field) => (
                <div key={field.name} className="flex items-start gap-3" style={{lineHeight: '2rem'}}>
                  <span className="text-sm font-semibold text-purple-400 min-w-[140px]">{field.label || field.name}: </span>
                  <span className="text-sm text-white">{getFieldValue(field)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspections */}
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-white">Inspections</h3>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => onAddInspection?.(equipment)}
            >
              Add Inspection
            </Button>
          </div>
          <div className="flex flex-col gap-6">
            {equipment.inspections?.length > 0 ? (
              equipment.inspections.map((inspection) => (
                <div key={inspection.inspection_id} className="flex flex-col gap-2">
                  <div className="flex items-start gap-3" style={{lineHeight: '2rem'}}>
                    <span className="text-sm font-semibold text-purple-400 min-w-[140px]">Date: </span>
                    <span className="text-sm text-white">{new Date(inspection.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-sm text-gray-400 ml-[156px]" style={{lineHeight: '2rem'}}>{inspection.notes || 'No notes'}</span>
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-400" style={{lineHeight: '2rem'}}>No inspections recorded</span>
            )}
          </div>
        </div>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1, justifyContent: 'space-between' }}>
        <Button
          onClick={handleDelete}
          color="error"
          variant="outlined"
          disabled={isDeleting}
          startIcon={<DeleteIcon />}
        >
          {isDeleting ? 'Deactivating...' : 'Deactivate'}
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
