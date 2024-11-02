'use client';

import React from 'react';
import { Box, Button, TextField, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { NewFieldState } from './types';

interface Props {
    options: string[];
    newOption: string;
    onChange: (updates: Partial<NewFieldState>) => void;
}

export default function SelectFieldConfig({ options, newOption, onChange }: Props) {
    const handleAddOption = () => {
        if (newOption && !options.includes(newOption)) {
            onChange({
                options: [...options, newOption],
                newOption: ''
            });
        }
    };

    const handleRemoveOption = (option: string) => {
        onChange({
            options: options.filter(o => o !== option)
        });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
            <Typography variant="subtitle2">Options</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <TextField
                    label="New Option"
                    value={newOption}
                    onChange={(e) => onChange({ newOption: e.target.value })}
                    size="small"
                />
                <Button 
                    variant="outlined" 
                    onClick={handleAddOption}
                    startIcon={<AddIcon />}
                >
                    Add Option
                </Button>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {options.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{option}</Typography>
                        <IconButton 
                            size="small" 
                            onClick={() => handleRemoveOption(option)}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
