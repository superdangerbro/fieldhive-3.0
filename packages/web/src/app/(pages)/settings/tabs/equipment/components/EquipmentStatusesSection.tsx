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
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getEquipmentStatuses, saveEquipmentStatuses } from '@/services/api';
import { EquipmentStatusConfig } from './types/equipment-status-types';
import { StatusColorPicker } from '@/components/StatusColorPicker';

interface EditDialogProps {
    open: boolean;
    status: EquipmentStatusConfig | null;
    onClose: () => void;
    onSave: (oldStatus: EquipmentStatusConfig | null, newStatus: EquipmentStatusConfig) => void;
}

function EditStatusDialog({ open, status, onClose, onSave }: EditDialogProps) {
    const [name, setName] = useState(status?.name || '');
    const [color, setColor] = useState(status?.color || '#94a3b8');

    useEffect(() => {
        if (status) {
            setName(status.name);
            setColor(status.color);
        } else {
            setName('');
            setColor('#94a3b8');
        }
    }, [status]);

    const handleSave = () => {
        onSave(status, { name: name.trim(), color });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                {status ? 'Edit Status' : 'New Status'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300, mt: 2 }}>
                    <TextField
                        label="Status Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                    />
                    
                    <StatusColorPicker 
                        color={color}
                        onChange={setColor}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSave}
                    variant="contained"
                    disabled={!name.trim()}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function EquipmentStatusesSection() {
    const [statuses, setStatuses] = useState<EquipmentStatusConfig[]>([]);
    const [editingStatus, setEditingStatus] = useState<EquipmentStatusConfig | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStatuses();
    }, []);

    const loadStatuses = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getEquipmentStatuses();
            // Convert string array to status configs if needed
            const statusArray = Array.isArray(response) ? response : [];
            const convertedStatuses = statusArray.map(status => {
                if (typeof status === 'string') {
                    // Convert legacy string format to new format
                    return { name: status, color: '#94a3b8' };
                }
                return status;
            });
            setStatuses(convertedStatuses);
        } catch (error) {
            console.error('Failed to load equipment statuses:', error);
            setError('Failed to load equipment statuses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStatus = () => {
        setEditingStatus(null);
        setIsDialogOpen(true);
    };

    const handleEditStatus = (status: EquipmentStatusConfig) => {
        setEditingStatus(status);
        setIsDialogOpen(true);
    };

    const handleDeleteStatus = async (statusToDelete: EquipmentStatusConfig) => {
        try {
            const updatedStatuses = statuses.filter(status => status.name !== statusToDelete.name);
            await saveEquipmentStatuses(updatedStatuses);
            await loadStatuses();
        } catch (error) {
            console.error('Error deleting equipment status:', error);
            setError('Failed to delete equipment status');
        }
    };

    const handleSaveStatus = async (oldStatus: EquipmentStatusConfig | null, newStatus: EquipmentStatusConfig) => {
        try {
            let updatedStatuses;
            if (oldStatus) {
                // Edit existing status
                updatedStatuses = statuses.map(status => 
                    status.name === oldStatus.name ? newStatus : status
                );
            } else {
                // Add new status
                updatedStatuses = [...statuses, newStatus];
            }
            
            await saveEquipmentStatuses(updatedStatuses);
            await loadStatuses();
        } catch (error) {
            console.error('Error saving equipment status:', error);
            setError('Failed to save equipment status');
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
                    onClick={loadStatuses}
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
                Equipment Statuses
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Configure the available equipment statuses that can be assigned to equipment
            </Typography>

            <Button 
                variant="contained" 
                onClick={handleAddStatus}
                sx={{ mb: 3 }}
            >
                Add Status
            </Button>

            <List>
                {statuses.map((status, index) => (
                    <ListItem 
                        key={index}
                        sx={{ 
                            p: 1,
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        <Box 
                            sx={{ 
                                width: 16, 
                                height: 16, 
                                borderRadius: 1,
                                bgcolor: status.color,
                                mr: 2
                            }} 
                        />
                        <ListItemText primary={status.name} />
                        <IconButton onClick={() => handleEditStatus(status)}>
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteStatus(status)}>
                            <DeleteIcon />
                        </IconButton>
                    </ListItem>
                ))}
            </List>

            <EditStatusDialog
                open={isDialogOpen}
                status={editingStatus}
                onClose={() => {
                    setIsDialogOpen(false);
                    setEditingStatus(null);
                }}
                onSave={handleSaveStatus}
            />
        </Box>
    );
}
