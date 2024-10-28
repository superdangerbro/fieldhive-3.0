import React from 'react';
import { DialogTitle, Stepper, Step, StepLabel } from '@mui/material';

interface DialogHeaderProps {
  activeStep: number;
}

const steps = ['Property Details', 'Account'];

export const DialogHeader: React.FC<DialogHeaderProps> = ({ activeStep }) => {
  return (
    <>
      <DialogTitle>Add Property</DialogTitle>
      <Stepper activeStep={activeStep} sx={{ px: 3, py: 2 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </>
  );
};
