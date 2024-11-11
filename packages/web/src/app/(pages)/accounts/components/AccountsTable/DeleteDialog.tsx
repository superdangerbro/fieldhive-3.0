'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert
} from '@mui/material';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  isLoading: boolean;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  selectedCount,
  isLoading
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Confirm Bulk Delete</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mt: 2 }}>
          Are you sure you want to delete {selectedCount} selected accounts? This action cannot be undone.
        </Alert>
        <Typography variant="body2" sx={{ mt: 2 }}>
          All associated data, including billing addresses, will be permanently deleted.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          disabled={isLoading}
          type="button"
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained" 
          color="error"
          disabled={isLoading}
          type="button"
        >
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
