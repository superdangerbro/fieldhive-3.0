'use client';

import React from 'react';
import { Box, Button, TextField } from '@mui/material';

interface Props {
    newTypeName: string;
    onTypeNameChange: (name: string) => void;
    onAddType: (e?: React.FormEvent) => void;
}

export default function AddEquipmentTypeForm({ newTypeName, onTypeNameChange, onAddType }: Props) {
    return (
        <Box component="form" onSubmit={onAddType} sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField
                label="New Equipment Type"
                value={newTypeName}
                onChange={(e) => onTypeNameChange(e.target.value)}
                sx={{ flex: 1 }}
            />
            <Button variant="contained" onClick={onAddType}>
                Add Type
            </Button>
        </Box>
    );
}
