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
import { StatusColorPicker } from '@/app/globalComponents/StatusColorPicker';
import { usePropertyStatuses, PropertyStatus } from './store';

interface EditDialogProps {
    open: boolean;
    status: PropertyStatus | null;
    onClose: () => void;
    onSave: (oldStatus: PropertyStatus | null, newStatus: PropertyStatus) => void;
}

function EditStatusDialog({ open, status, onClose, onSave }: EditDialogProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#94a3b8');

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
        const trimmedName = (name || '').trim();
        if (!trimmedName) return;

        onSave(status, {
            value: trimmedName.toLowerCase(),
            label: trimmedName,
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
                    disabled={!(name || '').trim()}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export function PropertyStatusSection() {
    const { statuses, isLoading, error, fetch, update } = usePropertyStatuses();
    const [editingStatus, setEditingStatus] = useState<PropertyStatus | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const handleAddStatus = () => {
        setEditingStatus(null);
        setIsDialogOpen(true);
    };

    const handleEditStatus = (status: PropertyStatus) => {
        setEditingStatus(status);
        setIsDialogOpen(true);
    };

    const handleDeleteStatus = async (statusToDelete: PropertyStatus) => {
        const updatedStatuses = statuses.filter(status => status.value !== statusToDelete.value);
        await update(updatedStatuses);
    };

    const handleSaveStatus = async (oldStatus: PropertyStatus | null, newStatus: PropertyStatus) => {
        const updatedStatuses = oldStatus
            ? statuses.map(status => status.value === oldStatus.value ? newStatus : status)
            : [...statuses, newStatus];
        
        await update(updatedStatuses);
        setIsDialogOpen(false);
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
                    onClick={fetch}
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
                Property Statuses
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Configure the available property statuses that can be assigned to properties
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
