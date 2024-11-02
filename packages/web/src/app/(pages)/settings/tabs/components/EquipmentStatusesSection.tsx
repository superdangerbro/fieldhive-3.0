'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getEquipmentStatuses, saveEquipmentStatuses } from '@/services/api';

export function EquipmentStatusesSection() {
    const [equipmentStatuses, setEquipmentStatuses] = useState<string[]>([]);
    const [newStatus, setNewStatus] = useState('');
    const [editingStatus, setEditingStatus] = useState<{ index: number; value: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load equipment statuses
    useEffect(() => {
        const loadStatuses = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const statusData = await getEquipmentStatuses();
                setEquipmentStatuses(statusData || []);
            } catch (error) {
                console.error('Error loading equipment statuses:', error);
                setError('Failed to load equipment statuses');
            } finally {
                setIsLoading(false);
            }
        };

        loadStatuses();
    }, []);

    const handleAddStatus = async () => {
        if (newStatus && !equipmentStatuses.includes(newStatus)) {
            try {
                const updatedStatuses = [...equipmentStatuses, newStatus].sort();
                await saveEquipmentStatuses(updatedStatuses);
                setEquipmentStatuses(updatedStatuses);
                setNewStatus('');
            } catch (error) {
                console.error('Error saving equipment statuses:', error);
            }
        }
    };

    const handleDeleteStatus = async (index: number) => {
        try {
            const updatedStatuses = equipmentStatuses.filter((_, i) => i !== index);
            await saveEquipmentStatuses(updatedStatuses);
            setEquipmentStatuses(updatedStatuses);
        } catch (error) {
            console.error('Error saving equipment statuses:', error);
        }
    };

    const handleEditStatus = (index: number) => {
        setEditingStatus({ index, value: equipmentStatuses[index] });
    };

    const handleSaveStatus = async () => {
        if (editingStatus && editingStatus.value) {
            try {
                const updatedStatuses = [...equipmentStatuses];
                updatedStatuses[editingStatus.index] = editingStatus.value;
                await saveEquipmentStatuses(updatedStatuses);
                setEquipmentStatuses(updatedStatuses);
                setEditingStatus(null);
            } catch (error) {
                console.error('Error saving equipment statuses:', error);
            }
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
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Equipment Statuses
            </Typography>
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        label="New Status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddStatus()}
                    />
                    <Button 
                        variant="contained" 
                        onClick={handleAddStatus}
                        disabled={!newStatus || equipmentStatuses.includes(newStatus)}
                    >
                        Add Status
                    </Button>
                </Box>
                <List>
                    {equipmentStatuses.map((status, index) => (
                        <ListItem 
                            key={index}
                            sx={{ 
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                mb: 1,
                                boxShadow: 1
                            }}
                        >
                            {editingStatus?.index === index ? (
                                <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                                    <TextField
                                        fullWidth
                                        value={editingStatus.value}
                                        onChange={(e) => setEditingStatus({ ...editingStatus, value: e.target.value })}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSaveStatus()}
                                    />
                                    <Button onClick={handleSaveStatus}>Save</Button>
                                    <Button onClick={() => setEditingStatus(null)}>Cancel</Button>
                                </Box>
                            ) : (
                                <>
                                    <ListItemText primary={status} />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" onClick={() => handleEditStatus(index)} sx={{ mr: 1 }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" onClick={() => handleDeleteStatus(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </>
                            )}
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );
}
