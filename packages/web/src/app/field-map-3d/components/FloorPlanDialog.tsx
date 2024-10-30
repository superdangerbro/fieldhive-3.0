import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Box,
  Typography,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useFieldMap3DStore } from '../../../stores/fieldMap3dStore';

interface FloorPlanDialogProps {
  onClose: () => void;
}

export function FloorPlanDialog({ onClose }: FloorPlanDialogProps) {
  const { selectedProperty, startPlacingFloorPlan } = useFieldMap3DStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [floor, setFloor] = useState(0); // Default to G

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleAddFloorPlan = () => {
    if (selectedFile && selectedProperty) {
      startPlacingFloorPlan({
        name: `${selectedProperty.name} Floor ${floor === 0 ? 'G' : floor}`,
        image: selectedFile,
        propertyId: selectedProperty.id,
        floor: floor
      });
      onClose();
    }
  };

  const incrementFloor = () => {
    if (floor < 20) setFloor(prev => prev + 1);
  };

  const decrementFloor = () => {
    if (floor > -5) setFloor(prev => prev - 1);
  };

  const getFloorLabel = (floor: number) => {
    if (floor === 0) return 'G';
    return floor > 0 ? floor : floor;
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Add Floor Plan - {selectedProperty?.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 4, mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select Floor
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={decrementFloor} disabled={floor <= -5}>
              <RemoveIcon />
            </IconButton>
            <TextField
              value={getFloorLabel(floor)}
              InputProps={{
                readOnly: true,
                sx: { 
                  width: '100px', 
                  textAlign: 'center',
                  '& input': {
                    textAlign: 'center'
                  }
                }
              }}
            />
            <IconButton onClick={incrementFloor} disabled={floor >= 20}>
              <AddIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Upload Floor Plan Image
          </Typography>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="floor-plan-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="floor-plan-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
            >
              {selectedFile ? selectedFile.name : 'Choose Floor Plan Image'}
            </Button>
          </label>
        </Box>

        <Button
          variant="contained"
          onClick={handleAddFloorPlan}
          fullWidth
          disabled={!selectedFile}
          sx={{ mt: 2 }}
        >
          Continue to Placement
        </Button>
      </DialogContent>
    </Dialog>
  );
}
