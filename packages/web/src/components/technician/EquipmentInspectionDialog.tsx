'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Equipment {
  id: string;
  type: string;
  location: [number, number];
  status: string;
}

interface EquipmentInspectionDialogProps {
  open: boolean;
  equipment: Equipment;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export function EquipmentInspectionDialog({
  open,
  equipment,
  onClose,
  onComplete,
}: EquipmentInspectionDialogProps) {
  const [inspectionData, setInspectionData] = useState({
    status: 'active',
    notes: '',
    barcode: '',
    image_url: '',
    inspected_by: '00000000-0000-0000-0000-000000000000' // Temporary default user ID
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/inspections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipment_id: equipment.id,
          ...inspectionData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save inspection');
      }

      const result = await response.json();
      onComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save inspection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          background: (theme) => theme.palette.background.default,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Inspect Equipment</Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Location: {equipment.location[0].toFixed(6)}, {equipment.location[1].toFixed(6)}
          </Typography>
          
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={inspectionData.status}
              label="Status"
              onChange={(e) => setInspectionData({ ...inspectionData, status: e.target.value })}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Barcode"
            value={inspectionData.barcode}
            onChange={(e) => setInspectionData({ ...inspectionData, barcode: e.target.value })}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            value={inspectionData.notes}
            onChange={(e) => setInspectionData({ ...inspectionData, notes: e.target.value })}
          />

          <TextField
            fullWidth
            label="Image URL"
            value={inspectionData.image_url}
            onChange={(e) => setInspectionData({ ...inspectionData, image_url: e.target.value })}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          fullWidth
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth
          disabled={submitting}
        >
          {submitting ? 'Saving...' : 'Complete Inspection'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
