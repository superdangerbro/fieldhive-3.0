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
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AccountStatus, StatusColor } from '@fieldhive/shared';
import { getSetting, updateSetting } from '@/services/api';

const SETTING_KEY = 'account_statuses';
const AVAILABLE_COLORS: StatusColor[] = ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'];

export function AccountStatusesSection() {
    const [statuses, setStatuses] = useState<AccountStatus[]>([]);
    const [newStatus, setNewStatus] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editColor, setEditColor] = useState<StatusColor>('default');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStatuses();
    }, []);

    const loadStatuses = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getSetting(SETTING_KEY);
            setStatuses(response?.statuses || []);
        } catch (error) {
            console.error('Failed to load account statuses:', error);
            setError('Failed to load account statuses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStatus = async () => {
        if (newStatus.trim()) {
            try {
                const newStatusConfig: AccountStatus = {
                    value: newStatus.trim().toLowerCase(),
                    label: newStatus.trim(),
                    color: 'default'
                };
                const updatedStatuses = [...statuses, newStatusConfig];
                await updateSetting(SETTING_KEY, { statuses: updatedStatuses });
                await loadStatuses();
                setNewStatus('');
            } catch (error) {
                console.error('Error adding account status:', error);
                setError('Failed to add account status');
            }
        }
    };

    const handleDeleteStatus = async (index: number) => {
        try {
            const updatedStatuses = statuses.filter((_, i) => i !== index);
            await updateSetting(SETTING_KEY, { statuses: updatedStatuses });
            await loadStatuses();
        } catch (error) {
            console.error('Error deleting account status:', error);
            setError('Failed to delete account status');
        }
    };

    const handleEditStatus = async () => {
        if (editingIndex !== null && editValue.trim()) {
            try {
                const updatedStatuses = statuses.map((status, index) => 
                    index === editingIndex ? { 
                        ...status,
                        value: editValue.trim().toLowerCase(),
                        label: editValue.trim(),
                        color: editColor
                    } : status
                );
                await updateSetting(SETTING_KEY, { statuses: updatedStatuses });
                await loadStatuses();
                setEditingIndex(null);
                setEditValue('');
                setEditColor('default');
            } catch (error) {
                console.error('Error updating account status:', error);
                setError('Failed to update account status');
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

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    placeholder="New Account Status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddStatus()}
                    sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        }
                    }}
                />
                <Button 
                    variant="contained" 
                    onClick={handleAddStatus}
                    disabled={!newStatus.trim()}
                    sx={{ 
                        bgcolor: 'primary.main',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                        }
                    }}
                >
                    Add Status
                </Button>
            </Box>

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
                        {editingIndex === index ? (
                            <Box sx={{ display: 'flex', gap: 2, flex: 1, alignItems: 'center' }}>
                                <TextField
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleEditStatus()}
                                    sx={{
                                        flex: 1,
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        }
                                    }}
                                />
                                <Select
                                    value={editColor}
                                    onChange={(e) => setEditColor(e.target.value as StatusColor)}
                                    sx={{ width: 150 }}
                                >
                                    {AVAILABLE_COLORS.map((color) => (
                                        <MenuItem key={color} value={color}>
                                            <Chip 
                                                label={color} 
                                                color={color}
                                                size="small"
                                            />
                                        </MenuItem>
                                    ))}
                                </Select>
                                <Button onClick={handleEditStatus}>Save</Button>
                                <Button onClick={() => {
                                    setEditingIndex(null);
                                    setEditValue('');
                                    setEditColor('default');
                                }}>Cancel</Button>
                            </Box>
                        ) : (
                            <>
                                <Box 
                                    sx={{ 
                                        width: 16, 
                                        height: 16, 
                                        borderRadius: 1,
                                        bgcolor: `${status.color}.main`,
                                        mr: 2
                                    }} 
                                />
                                <ListItemText primary={status.label} />
                                <IconButton onClick={() => {
                                    setEditingIndex(index);
                                    setEditValue(status.label);
                                    setEditColor(status.color);
                                }}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteStatus(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        )}
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}
