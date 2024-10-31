'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { useFieldMapStore } from '../../../stores/fieldMapStore';

interface FloorPlanDialogProps {
  open: boolean;
  onClose: () => void;
  propertyId: string;
}

export const FloorPlanDialog: React.FC<FloorPlanDialogProps> = ({ open, onClose, propertyId }) => {
  const [name, setName] = useState('');
  const [floor, setFloor] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { addFloorPlan } = useFieldMapStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && floor && file) {
      // In a real application, you would upload the file to a server here
      // and get back a URL for the uploaded image.
      // For this example, we'll create a fake URL
      const fakeImageUrl = URL.createObjectURL(file);
      
      addFloorPlan({
        id: Date.now().toString(), // Generate a temporary ID
        name,
        imageUrl: fakeImageUrl,
        visible: true,
        floor: parseInt(floor, 10),
        propertyId,
      });
      
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Floor Plan</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Floor Plan Name"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              margin="dense"
              label="Floor Number"
              type="number"
              fullWidth
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              required
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            />
            <label htmlFor="raised-button-file">
              <Button variant="contained" component="span">
                Upload Floor Plan Image
              </Button>
            </label>
            {file && <Box sx={{ mt: 1 }}>{file.name}</Box>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!name || !floor || !file}>
            Add Floor Plan
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
