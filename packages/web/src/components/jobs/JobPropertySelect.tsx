'use client';

import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Property } from '@fieldhive/shared';

interface JobPropertySelectProps {
    selectedProperty: Property | null;
    properties: Property[];
    onChange: (property: Property | null) => void;
}

export default function JobPropertySelect({
    selectedProperty,
    properties,
    onChange
}: JobPropertySelectProps) {
    return (
        <Autocomplete
            options={properties}
            getOptionLabel={(option) => option.name}
            value={selectedProperty}
            onChange={(_, newValue) => onChange(newValue)}
            isOptionEqualToValue={(option, value) => option.property_id === value.property_id}
            renderInput={(params) => (
                <TextField {...params} label="Property" />
            )}
        />
    );
}
