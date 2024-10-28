import React from 'react';
import { DialogActions as MuiDialogActions, Button } from '@mui/material';

interface DialogActionsProps {
  activeStep: number;
  totalSteps: number;
  onClose: () => void;
  onBack: () => void;
  onNext: () => void;
}

export const DialogActions: React.FC<DialogActionsProps> = ({
  activeStep,
  totalSteps,
  onClose,
  onBack,
  onNext,
}) => {
  return (
    <MuiDialogActions sx={{ px: 3, py: 2, gap: 1 }}>
      <Button onClick={onClose} color="inherit">
        Cancel
      </Button>
      <div style={{ flex: '1 0 0' }} />
      {activeStep > 0 && (
        <Button onClick={onBack}>
          Back
        </Button>
      )}
      <Button
        variant="contained"
        onClick={onNext}
      >
        {activeStep === totalSteps - 1 ? 'Create' : 'Next'}
      </Button>
    </MuiDialogActions>
  );
};
