'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getSetting, updateSetting } from '@/services/api';

export function PropertiesTab() {
    const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
    const [propertyStatuses, setPropertyStatuses] = useState<string[]>([]);
    const [newType, setNewType] = useState('');
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const types = await getSetting('property_types');
            const statuses = await getSetting('property_statuses');
            
            if (Array.isArray(types)) {
                setPropertyTypes(types);
            } else {
                setPropertyTypes(['residential', 'commercial', 'industrial', 'agricultural', 'other']);
            }
            
            if (Array.isArray(statuses)) {
                setPropertyStatuses(statuses);
            } else {
                setPropertyStatuses(['Active', 'Inactive', 'Archived', 'Pending']);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const handleAddType = async () => {
        if (!newType) return;
        const updatedTypes = [...propertyTypes, newType];
        try {
            await updateSetting('property_types', updatedTypes);
            setPropertyTypes(updatedTypes);
            setNewType('');
        } catch (error) {
            console.error('Failed to add property type:', error);
        }
    };

    const handleAddStatus = async () => {
        if (!newStatus) return;
        const updatedStatuses = [...propertyStatuses, newStatus];
        try {
            await updateSetting('property_statuses', updatedStatuses);
            setPropertyStatuses(updatedStatuses);
            setNewStatus('');
        } catch (error) {
            console.error('Failed to add property status:', error);
        }
    };

    const handleDeleteType = async (index: number) => {
        const updatedTypes = propertyTypes.filter((_, i) => i !== index);
        try {
            await updateSetting('property_types', updatedTypes);
            setPropertyTypes(updatedTypes);
        } catch (error) {
            console.error('Failed to delete property type:', error);
        }
    };

    const handleDeleteStatus = async (index: number) => {
        const updatedStatuses = propertyStatuses.filter((_, i) => i !== index);
        try {
            await updateSetting('property_statuses', updatedStatuses);
            setPropertyStatuses(updatedStatuses);
        } catch (error) {
            console.error('Failed to delete property status:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 4 }}>
            <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>Property Types</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                        size="small"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        placeholder="New type"
                        fullWidth
                    />
                    <IconButton color="primary" onClick={handleAddType}>
                        <AddIcon />
                    </IconButton>
                </Box>
                <List>
                    {propertyTypes.map((type, index) => (
                        <ListItem
                            key={index}
                            secondaryAction={
                                <IconButton edge="end" onClick={() => handleDeleteType(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText primary={type} />
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Paper sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" gutterBottom>Property Statuses</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                        size="small"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        placeholder="New status"
                        fullWidth
                    />
                    <IconButton color="primary" onClick={handleAddStatus}>
                        <AddIcon />
                    </IconButton>
                </Box>
                <List>
                    {propertyStatuses.map((status, index) => (
                        <ListItem
                            key={index}
                            secondaryAction={
                                <IconButton edge="end" onClick={() => handleDeleteStatus(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText primary={status} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
}
