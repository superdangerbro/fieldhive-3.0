'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getSetting, updateSetting } from '@/services/api';
import { PropertyTypeConfig } from './types/property-settings';

export function PropertyTypesSection() {
    const [types, setTypes] = useState<PropertyTypeConfig[]>([]);
    const [newType, setNewType] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTypes();
    }, []);

    const loadTypes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getSetting('property_types');
            setTypes(response?.types || []);
        } catch (error) {
            console.error('Failed to load property types:', error);
            setError('Failed to load property types');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddType = async () => {
        if (!newType.trim()) return;
        
        try {
            const newTypeConfig: PropertyTypeConfig = {
                name: newType.trim()
            };
            const updatedTypes = [...types, newTypeConfig];
            await updateSetting('property_types', { types: updatedTypes });
            await loadTypes();
            setNewType('');
        } catch (error) {
            console.error('Failed to add property type:', error);
            setError('Failed to add property type');
        }
    };

    const handleDeleteType = async (index: number) => {
        try {
            const updatedTypes = types.filter((_, i) => i !== index);
            await updateSetting('property_types', { types: updatedTypes });
            await loadTypes();
        } catch (error) {
            console.error('Failed to delete property type:', error);
            setError('Failed to delete property type');
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2, color: 'error.main' }}>
                <Typography>{error}</Typography>
                <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={loadTypes}
                    sx={{ mt: 1 }}
                >
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Property Types
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Configure the available property types that can be assigned to properties
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    placeholder="New Property Type"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddType()}
                    sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        }
                    }}
                />
                <Button 
                    variant="contained" 
                    onClick={handleAddType}
                    disabled={!newType.trim()}
                    sx={{ 
                        bgcolor: 'primary.main',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                        }
                    }}
                >
                    Add Type
                </Button>
            </Box>

            <List>
                {types.map((type, index) => (
                    <ListItem 
                        key={index}
                        sx={{ 
                            p: 1,
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        <ListItemText primary={type.name} />
                        <IconButton onClick={() => handleDeleteType(index)}>
                            <DeleteIcon />
                        </IconButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}
