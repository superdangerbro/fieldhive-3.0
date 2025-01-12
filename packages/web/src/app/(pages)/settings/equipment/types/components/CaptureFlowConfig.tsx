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
                            disabled // Always require barcode for equipment capture
                        />
                    }
                    label="Require Barcode"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config.requirePhoto}
                            onChange={(e) => handleChange('requirePhoto', e.target.checked)}
                            disabled // Always require photo for equipment capture
                        />
                    }
                    label="Require Photo"
                />
                <TextField
                    label="Photo Instructions"
                    value={config.photoInstructions || ''}
                    onChange={(e) => handleChange('photoInstructions', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    sx={{ mt: 2 }}
                />
            </FormGroup>
        </Box>
    );
}
