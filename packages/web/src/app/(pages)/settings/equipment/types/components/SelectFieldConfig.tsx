'use client';

import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Chip,
    FormControlLabel,
    Checkbox,
    Typography
} from '@mui/material';
import type { SelectConfig } from './types';

interface SelectFieldConfigProps {
    config?: SelectConfig;
    onChange: (config: SelectConfig) => void;
}

export function SelectFieldConfig({ config = { options: [] }, onChange }: SelectFieldConfigProps) {
    console.log('SelectFieldConfig render:', { config });
    const [newOption, setNewOption] = useState('');

    const handleAddOption = () => {
        if (!newOption.trim()) return;
        
        const option = newOption.trim();
        if (config.options.includes(option)) {
            console.warn('Option already exists:', option);
            alert('This option already exists');
            return;
        }

        console.log('Adding option:', option);
        onChange({
            ...config,
            options: [...config.options, option]
        });
        setNewOption('');
    };

    const handleDeleteOption = (optionToDelete: string) => {
        console.log('Deleting option:', optionToDelete);
        onChange({
            ...config,
            options: config.options.filter(option => option !== optionToDelete)
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddOption();
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    label="Add Option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={handleKeyPress}
                    fullWidth
                    helperText="Press Enter or click Add to add an option"
                />
                <Button 
                    onClick={handleAddOption}
                    disabled={!newOption.trim()}
                    sx={{ minWidth: 100 }}
                >
                    Add
                </Button>
            </Box>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={config.multiple || false}
                        onChange={(e) => onChange({ ...config, multiple: e.target.checked })}
                    />
                }
                label="Allow Multiple Selections"
            />

            {config.options.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {config.options.map((option) => (
                        <Chip
                            key={option}
                            label={option}
                            onDelete={() => handleDeleteOption(option)}
                        />
                    ))}
                </Box>
            ) : (
                <Typography color="text.secondary" variant="body2">
                    No options added yet
                </Typography>
            )}
        </Box>
    );
}
