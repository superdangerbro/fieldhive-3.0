'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getSetting, updateSetting } from '@/services/api';
import { AccountStatus } from './types/accountStatus';
import { StatusColorPicker } from '@/components/StatusColorPicker';

interface EditDialogProps {
    open: boolean;
    status: AccountStatus | null;
    onClose: () => void;
    onSave: (oldStatus: AccountStatus | null, newStatus: AccountStatus) => void;
}

function EditStatusDialog({ open, status, onClose, onSave }: EditDialogProps) {
    const [name, setName] = useState(status?.label || '');
    const [color, setColor] = useState(status?.color || '#94a3b8');

    useEffect(() => {
        if (status) {
            setName(status.label);
            setColor(status.color);
        } else {
            setName('');
            setColor('#94a3b8');
        }
    }, [status]);

    const handleSave = () => {
        onSave(status, {
            value: name.trim().toLowerCase(),
            label: name.trim(),
            color
        });
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

export function AccountStatusesSection() {
    const [statuses, setStatuses] = useState<AccountStatus[]>([]);
    const [editingStatus, setEditingStatus] = useState<AccountStatus | null>(null);
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
            const response = await getSetting('account_statuses');
            setStatuses(response?.statuses || []);
        } catch (error) {
            console.error('Failed to load account statuses:', error);
            setError('Failed to load account statuses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStatus = () => {
        setEditingStatus(null);
        setIsDialogOpen(true);
    };

    const handleEditStatus = (status: AccountStatus) => {
        setEditingStatus(status);
        setIsDialogOpen(true);
    };

    const handleDeleteStatus = async (statusToDelete: AccountStatus) => {
        try {
            const updatedStatuses = statuses.filter(status => status.value !== statusToDelete.value);
            await updateSetting('account_statuses', { statuses: updatedStatuses });
            await loadStatuses();
        } catch (error) {
            console.error('Error deleting account status:', error);
            setError('Failed to delete account status');
        }
    };

    const handleSaveStatus = async (oldStatus: AccountStatus | null, newStatus: AccountStatus) => {
        try {
            let updatedStatuses;
            if (oldStatus) {
                // Edit existing status
                updatedStatuses = statuses.map(status => 
                    status.value === oldStatus.value ? newStatus : status
                );
            } else {
                // Add new status
                updatedStatuses = [...statuses, newStatus];
            }
            
            await updateSetting('account_statuses', { statuses: updatedStatuses });
            await loadStatuses();
        } catch (error) {
            console.error('Error saving account status:', error);
            setError('Failed to save account status');
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
                Account Statuses
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Configure the available account statuses that can be assigned to accounts
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
                        <ListItemText primary={status.label} />
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
