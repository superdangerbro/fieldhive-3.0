'use client';

import React from 'react';
import {
    Box,
    FormControlLabel,
    Checkbox,
    TextField,
    Typography,
    FormGroup,
} from '@mui/material';
import type { CaptureFlowConfig as CaptureFlowConfigType } from './types';

interface CaptureFlowConfigProps {
    config: CaptureFlowConfigType;
    onChange: (config: CaptureFlowConfigType) => void;
}

export function CaptureFlowConfig({ config, onChange }: CaptureFlowConfigProps) {
    const handleChange = (field: keyof CaptureFlowConfigType, value: any) => {
        onChange({
            ...config,
            [field]: value
        });
    };

    return (
        <Box>
            <FormGroup>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config.requireBarcode}
                            onChange={(e) => handleChange('requireBarcode', e.target.checked)}
                        />
                    }
                    label="Require Barcode"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config.requirePhoto}
                            onChange={(e) => handleChange('requirePhoto', e.target.checked)}
                        />
                    }
                    label="Require Photo"
                />
            </FormGroup>

            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Photo Instructions
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={config.photoInstructions || ''}
                    onChange={(e) => handleChange('photoInstructions', e.target.value)}
                    placeholder="Enter instructions for taking the photo (optional)"
                    size="small"
                />
            </Box>
        </Box>
    );
}
