'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Grid,
    MenuItem,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import { updateProperty } from '../../services/api';
import { Property, PropertyType, PropertyStatus, UpdatePropertyRequest } from '@fieldhive/shared';

export interface EditPropertyDialogProps {
    open: boolean;
    property: Property | null;
    onClose: () => void;
    onSuccess: () => void;
}

type PropertyFormData = {
    name: string;
    address: string;
    type: PropertyType;
    status: PropertyStatus;
    location: {
        latitude: string;
        longitude: string;
    };
};

export default function EditPropertyDialog({ open, property, onClose, onSuccess }: EditPropertyDialogProps) {
    const [formData, setFormData] = useState<PropertyFormData>({
        name: '',
        address: '',
        type: PropertyType.RESIDENTIAL,
        status: PropertyStatus.ACTIVE,
        location: {
            latitude: '',
            longitude: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (property) {
            setFormData({
                name: property.name,
                address: property.address,
                type: property.type,
                status: property.status,
                location: {
                    latitude: property.location.coordinates[1].toString(),
                    longitude: property.location.coordinates[0].toString()
                }
            });
        }
    }, [property]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('location.')) {
            const field = name.replace('location.', '') as keyof PropertyFormData['location'];
            setFormData(prev => ({
                ...prev,
                location: {
                    ...prev.location,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!property) return;

        setLoading(true);
        setError(null);

        try {
            const updateData: UpdatePropertyRequest = {
                name: formData.name,
                address: formData.address,
                type: formData.type,
                status: formData.status,
                location: {
                    type: 'Point',
                    coordinates: [
                        parseFloat(formData.location.longitude),
                        parseFloat(formData.location.latitude)
                    ]
                }
            };

            await updateProperty(property.id, updateData);
            onSuccess();
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update property');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit Property</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Box sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        name="name"
                                        label="Property Name"
                                        fullWidth
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="address"
                                        label="Address"
                                        fullWidth
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        name="type"
                                        label="Property Type"
                                        fullWidth
                                        required
                                        value={formData.type}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        {Object.values(PropertyType).map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type.split('_').map(word => 
                                                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                                ).join(' ')}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        name="status"
                                        label="Status"
                                        fullWidth
                                        required
                                        value={formData.status}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        {Object.values(PropertyStatus).map((status) => (
                                            <MenuItem key={status} value={status}>
                                                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        name="location.latitude"
                                        label="Latitude"
                                        fullWidth
                                        required
                                        type="number"
                                        value={formData.location.latitude}
                                        onChange={handleChange}
                                        disabled={loading}
                                        inputProps={{
                                            step: 'any'
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        name="location.longitude"
                                        label="Longitude"
                                        fullWidth
                                        required
                                        type="number"
                                        value={formData.location.longitude}
                                        onChange={handleChange}
                                        disabled={loading}
                                        inputProps={{
                                            step: 'any'
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleClose} color="inherit" disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
                                textTransform: 'none'
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
}
