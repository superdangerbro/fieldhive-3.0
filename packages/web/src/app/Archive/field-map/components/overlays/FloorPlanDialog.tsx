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
import { useFieldMapStore } from '../../../../stores/fieldMapStore';

interface FloorPlanDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Handler for closing the dialog */
  onClose: () => void;
  /** ID of the property to add the floor plan to */
  propertyId: string;
}

interface FloorPlanData {
  id: string;
  name: string;
  imageUrl: string;
  visible: boolean;
  floor: number;
  propertyId: string;
}

/**
 * Dialog for adding new floor plans
 * Features:
 * - Floor plan name input
 * - Floor number input
 * - Image upload
 * - Form validation
 * 
 * @component
 * @example
 * ```tsx
 * <FloorPlanDialog
 *   open={showDialog}
 *   onClose={() => setShowDialog(false)}
 *   propertyId="property-123"
 * />
 * ```
 */
export const FloorPlanDialog: React.FC<FloorPlanDialogProps> = ({ 
  open, 
  onClose, 
  propertyId 
}) => {
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
      
      const floorPlanData: FloorPlanData = {
        id: Date.now().toString(), // Generate a temporary ID
        name,
        imageUrl: fakeImageUrl,
        visible: true,
        floor: parseInt(floor, 10),
        propertyId,
      };

      addFloorPlan(floorPlanData);
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
              helperText="Enter a descriptive name for the floor plan"
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
              helperText="Enter the floor number (e.g., 1, 2, -1 for basement)"
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
            {file && (
              <Box sx={{ mt: 1, color: 'text.secondary' }}>
                Selected file: {file.name}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!name || !floor || !file}
          >
            Add Floor Plan
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
