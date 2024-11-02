'use client';

import React from 'react';
import { Box, TextField, Button } from '@mui/material';

interface AddEquipmentTypeFormProps {
    newTypeName: string;
    onTypeNameChange: (value: string) => void;
    onAddType: (e?: React.FormEvent) => void;
}

export function AddEquipmentTypeForm({ 
    newTypeName, 
    onTypeNameChange, 
    onAddType 
}: AddEquipmentTypeFormProps) {
    return (
        <Box 
            component="form" 
            onSubmit={onAddType}
            sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 2 
            }}
        >
            <TextField
                label="New Equipment Type"
                value={newTypeName}
                onChange={(e) => onTypeNameChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && onAddType(e)}
            />
            <Button 
                variant="contained" 
                onClick={onAddType}
                disabled={!newTypeName}
            >
                Add Type
            </Button>
        </Box>
    );
}
