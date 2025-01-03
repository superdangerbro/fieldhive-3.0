'use client';

import React from 'react';
import {
    Box,
    TextField,
    Button,
    Chip,
    Stack,
} from '@mui/material';
import type { SelectConfig } from './types';

interface SelectFieldConfigProps {
    config?: SelectConfig;
    onChange: (config: SelectConfig) => void;
}

export function SelectFieldConfig({ config = { options: [] }, onChange }: SelectFieldConfigProps) {
    const [newOption, setNewOption] = React.useState('');

    const handleAddOption = () => {
        if (!newOption.trim()) return;
        
        onChange({
            ...config,
            options: [...config.options, newOption.trim()]
        });
        setNewOption('');
    };

    const handleRemoveOption = (optionToRemove: string) => {
        onChange({
            ...config,
            options: config.options.filter(option => option !== optionToRemove)
        });
    };

    return (
        <Box>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                    size="small"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOption();
                        }
                    }}
                    placeholder="Add option..."
                    fullWidth
                />
                <Button
                    variant="outlined"
                    onClick={handleAddOption}
                    disabled={!newOption.trim()}
                >
                    Add
                </Button>
            </Stack>
            
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {config.options.map((option) => (
                    <Chip
                        key={option}
                        label={option}
                        onDelete={() => handleRemoveOption(option)}
                        sx={{ mb: 1 }}
                    />
                ))}
            </Stack>
        </Box>
    );
}
