'use client';

import React from 'react';
import { 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Alert,
    MenuItem
} from '@mui/material';
import { useCreateProperty } from '../../hooks/usePropertyCreate';
import { useSelectedProperty } from '../../hooks/useSelectedProperty';
import { usePropertySettings } from '../../hooks/usePropertySettings';
import type { CreatePropertyDto } from '@/app/globalTypes/property';

interface AddPropertyDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function AddPropertyDialog({ open, onClose }: AddPropertyDialogProps) {
    const { mutate: createProperty, isPending: loading, error } = useCreateProperty();
    const { setSelectedProperty } = useSelectedProperty();
    const { types: propertyTypes, isLoading: typesLoading } = usePropertySettings();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        const propertyData: CreatePropertyDto = {
            name: formData.get('name') as string,
            type: formData.get('type') as string,
            status: 'active'
        };

        createProperty(propertyData, {
            onSuccess: (newProperty) => {
                setSelectedProperty(newProperty);
                onClose();
            }
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add New Property</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        {error && (
                            <Alert severity="error">
                                {error instanceof Error ? error.message : 'Failed to create property'}
                            </Alert>
                        )}
                        <TextField
                            name="name"
                            label="Property Name"
                            required
                            fullWidth
                            autoFocus
                        />
                        <TextField
                            name="type"
                            label="Property Type"
                            required
                            fullWidth
                            select
                            disabled={typesLoading}
                        >
                            {propertyTypes.map((type) => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        type="submit"
                        variant="contained"
                        disabled={loading || typesLoading}
                    >
                        {loading ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
