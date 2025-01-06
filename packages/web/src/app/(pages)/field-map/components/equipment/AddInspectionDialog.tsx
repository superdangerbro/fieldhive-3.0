'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Equipment } from '@/app/globalTypes/equipment';
import { useInspections } from '@/app/hooks/useInspections';
import { useAuth } from '@/app/hooks/useAuth';

interface AddInspectionDialogProps {
  equipment: Equipment;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddInspectionDialog({
  equipment,
  open,
  onClose,
  onSuccess
}: AddInspectionDialogProps) {
  const { user, isLoading: isLoadingUser } = useAuth();
  const { createInspection } = useInspections();
  const [notes, setNotes] = useState('');
  const [barcode, setBarcode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.user_id) {
      alert('You must be logged in to create an inspection');
      return;
    }

    try {
      setIsSubmitting(true);
      await createInspection.mutateAsync({
        equipment_id: equipment.equipment_id,
        inspector_id: user.user_id,
        property_id: equipment.job?.property?.property_id,
        barcode,
        notes,
        data: {
          equipment_type: equipment.type,
          job_id: equipment.job?.id
        },
        location: equipment.location
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create inspection:', error);
      alert(error instanceof Error ? error.message : 'Failed to create inspection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle>
        Add Inspection
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {isLoadingUser ? (
          <Box className="flex justify-center py-4">
            <CircularProgress />
          </Box>
        ) : !user ? (
          <Alert severity="error" className="my-4">
            You must be logged in to create an inspection
          </Alert>
        ) : (
          <Box className="flex flex-col gap-6 py-4">
            <div>
              <Typography variant="subtitle2" className="mb-2 text-purple-400">
                Equipment Type
              </Typography>
              <Typography variant="body2">
                {equipment.type}
              </Typography>
            </div>

            <div>
              <Typography variant="subtitle2" className="mb-2 text-purple-400">
                Equipment ID
              </Typography>
              <Typography variant="body2" className="font-mono">
                {equipment.equipment_id}
              </Typography>
            </div>

            <TextField
              label="Barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
            />

            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              size="small"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || isLoadingUser || !user}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Creating...' : 'Create Inspection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
