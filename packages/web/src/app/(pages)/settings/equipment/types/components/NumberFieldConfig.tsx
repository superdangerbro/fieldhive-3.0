'use client';

import React from 'react';
import { Box, TextField } from '@mui/material';
import type { NumberConfig } from './types';

interface NumberFieldConfigProps {
    config?: NumberConfig;
    onChange: (config: NumberConfig) => void;
}

export function NumberFieldConfig({ config = {}, onChange }: NumberFieldConfigProps) {
    console.log('NumberFieldConfig render:', { config });

    const handleChange = (field: keyof NumberConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? undefined : Number(e.target.value);
        console.log('Number field change:', { field, value });
        onChange({
            ...config,
            [field]: value
        });
    };

    return (
        <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
                label="Minimum"
                type="number"
                value={config.min ?? ''}
                onChange={handleChange('min')}
                helperText="Optional minimum value"
            />
            <TextField
                label="Maximum"
                type="number"
                value={config.max ?? ''}
                onChange={handleChange('max')}
                helperText="Optional maximum value"
            />
            <TextField
                label="Step"
                type="number"
                value={config.step ?? ''}
                onChange={handleChange('step')}
                helperText="Optional step value"
            />
        </Box>
    );
}
