'use client';

import React from 'react';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    TextField,
    InputLabel,
    FormControl,
} from '@mui/material';
import { FormField } from './types';

// Generate floor options
const generateFloorOptions = () => {
    const options = [];
    // Lower floors (L5 to L1)
    for (let i = 5; i >= 1; i--) {
        options.push({ value: -i, label: `L${i}` });
    }
    // Ground floor
    options.push({ value: 0, label: 'G' });
    // Upper floors (1 to 10)
    for (let i = 1; i <= 10; i++) {
        options.push({ value: i, label: i.toString() });
    }
    return options;
};

const FLOOR_OPTIONS = generateFloorOptions();

// Default saved fields that can be added to any equipment type
const defaultSavedFields: FormField[] = [
    {
        name: 'is_interior',
        label: 'Interior Equipment',
        type: 'checkbox',
        required: false,
        description: 'Whether this equipment is located inside a building'
    },
    {
        name: 'floor',
        label: 'Floor',
        type: 'select',
        required: false,
        description: 'Floor number where the equipment is located',
        conditions: [{
            field: 'is_interior',
            value: true,
            makeRequired: false
        }],
        config: {
            options: FLOOR_OPTIONS.map(opt => opt.label),
            allowCustom: true,
            defaultValue: 'G'
        }
    }
];

interface SavedFieldsProps {
    onAddFields: (fields: FormField[]) => void;
    existingFields: string[];
}

export function SavedFields({ onAddFields, existingFields }: SavedFieldsProps) {
    const [selectedFields, setSelectedFields] = React.useState<string[]>([]);
    
    // Filter out already added fields
    const availableFields = defaultSavedFields.filter(
        field => !existingFields.includes(field.name)
    );

    const handleToggleField = (fieldName: string) => {
        setSelectedFields(prev => 
            prev.includes(fieldName) 
                ? prev.filter(f => f !== fieldName)
                : [...prev, fieldName]
        );
    };

    const handleAddSelected = () => {
        const fieldsToAdd = defaultSavedFields.filter(
            field => selectedFields.includes(field.name)
        );
        onAddFields(fieldsToAdd);
        setSelectedFields([]); // Reset selection
    };

    if (availableFields.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                All saved fields have been added
            </Typography>
        );
    }

    return (
        <Box>
            <List>
                {availableFields.map((field) => (
                    <ListItem
                        key={field.name}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            py: 0.5
                        }}
                        disablePadding
                    >
                        <FormControlLabel
                            control={
                                field.name === 'is_interior' ? (
                                    <Switch
                                        checked={selectedFields.includes(field.name)}
                                        onChange={() => handleToggleField(field.name)}
                                        size="small"
                                    />
                                ) : (
                                    <Checkbox
                                        checked={selectedFields.includes(field.name)}
                                        onChange={() => handleToggleField(field.name)}
                                        size="small"
                                    />
                                )
                            }
                            label={
                                <Box>
                                    <Typography variant="subtitle2">
                                        {field.label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        {field.description}
                                    </Typography>
                                </Box>
                            }
                            sx={{ flex: 1 }}
                        />
                    </ListItem>
                ))}
            </List>
            
            {selectedFields.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleAddSelected}
                    >
                        Add {selectedFields.length} Field{selectedFields.length > 1 ? 's' : ''}
                    </Button>
                </Box>
            )}
        </Box>
    );
}
