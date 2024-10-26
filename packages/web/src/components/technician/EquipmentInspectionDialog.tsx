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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';

interface Equipment {
  id: number;
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
    status: 'ok',
    notes: '',
    actionTaken: 'none',
    timestamp: format(new Date(), 'yyyy-MM-dd\'T\'HH:mm'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      equipmentId: equipment.id,
      ...inspectionData,
    });
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
              <MenuItem value="ok">OK</MenuItem>
              <MenuItem value="needs_attention">Needs Attention</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Action Taken</InputLabel>
            <Select
              value={inspectionData.actionTaken}
              label="Action Taken"
              onChange={(e) => setInspectionData({ ...inspectionData, actionTaken: e.target.value })}
            >
              <MenuItem value="none">No Action Required</MenuItem>
              <MenuItem value="cleaned">Cleaned</MenuItem>
              <MenuItem value="repaired">Repaired</MenuItem>
              <MenuItem value="replaced">Replaced</MenuItem>
            </Select>
          </FormControl>

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
            type="datetime-local"
            label="Timestamp"
            value={inspectionData.timestamp}
            onChange={(e) => setInspectionData({ ...inspectionData, timestamp: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          fullWidth
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth
        >
          Complete Inspection
        </Button>
      </DialogActions>
    </Dialog>
  );
}
