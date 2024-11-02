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
import { getSetting, updateSetting } from '@/services/api';

const SETTING_KEY = 'job_statuses';
const AVAILABLE_COLORS = ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'] as const;

interface JobStatus {
    name: string;
    color: typeof AVAILABLE_COLORS[number];
}

interface EditingStatus {
    index: number;
    value: JobStatus;
}

export function JobStatusesSection() {
    const [statuses, setStatuses] = useState<JobStatus[]>([]);
    const [newStatus, setNewStatus] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [editColor, setEditColor] = useState<typeof AVAILABLE_COLORS[number]>('default');
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
            // API returns array directly
            setStatuses(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error('Failed to load job statuses:', error);
            setError('Failed to load job statuses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStatus = async () => {
        if (newStatus.trim()) {
            try {
                const newStatusConfig: JobStatus = {
                    name: newStatus.trim(),
                    color: 'default'
                };
                const updatedStatuses = [...statuses, newStatusConfig];
                await updateSetting(SETTING_KEY, updatedStatuses);
                await loadStatuses();
                setNewStatus('');
            } catch (error) {
                console.error('Error adding job status:', error);
                setError('Failed to add job status');
            }
        }
    };

    const handleDeleteStatus = async (index: number) => {
        try {
            const updatedStatuses = statuses.filter((_, i) => i !== index);
            await updateSetting(SETTING_KEY, updatedStatuses);
            await loadStatuses();
        } catch (error) {
            console.error('Error deleting job status:', error);
            setError('Failed to delete job status');
        }
    };

    const handleEditStatus = async () => {
        if (editingIndex !== null && editValue.trim()) {
            try {
                const updatedStatuses = statuses.map((status, index) => 
                    index === editingIndex ? { 
                        ...status,
                        name: editValue.trim(),
                        color: editColor
                    } : status
                );
                await updateSetting(SETTING_KEY, updatedStatuses);
                await loadStatuses();
                setEditingIndex(null);
                setEditValue('');
                setEditColor('default');
            } catch (error) {
                console.error('Error updating job status:', error);
                setError('Failed to update job status');
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
                Job Statuses
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Configure the available job statuses that can be assigned to jobs
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    placeholder="New Job Status"
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
                                    onChange={(e) => setEditColor(e.target.value as typeof AVAILABLE_COLORS[number])}
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
                                <ListItemText primary={status.name} />
                                <IconButton onClick={() => {
                                    setEditingIndex(index);
                                    setEditValue(status.name);
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
