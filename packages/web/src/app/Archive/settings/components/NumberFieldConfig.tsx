'use client';

import React from 'react';
import { Box, TextField } from '@mui/material';
import { NumberConfig } from './types';

interface Props {
    config: NumberConfig;
    onChange: (config: NumberConfig) => void;
}

export default function NumberFieldConfig({ config, onChange }: Props) {
    return (
        <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
            <TextField
                label="Min"
                type="number"
                value={config.min || ''}
                onChange={(e) => onChange({
                    ...config,
                    min: Number(e.target.value)
                })}
                size="small"
            />
            <TextField
                label="Max"
                type="number"
                value={config.max || ''}
                onChange={(e) => onChange({
                    ...config,
                    max: Number(e.target.value)
                })}
                size="small"
            />
            <TextField
                label="Step"
                type="number"
                value={config.step || ''}
                onChange={(e) => onChange({
                    ...config,
                    step: Number(e.target.value)
                })}
                size="small"
            />
        </Box>
    );
}
