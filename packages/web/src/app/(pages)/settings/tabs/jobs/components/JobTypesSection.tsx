'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getSetting, updateSetting } from '@/services/api';
import { JobTypeConfig } from './types/job-types';

interface JobType {
    id: string;
    name: string;
}

export function JobTypesSection() {
    const [jobTypes, setJobTypes] = useState<JobTypeConfig[]>([]);
    const [newJobType, setNewJobType] = useState('');
    const [editingTypeIndex, setEditingTypeIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTypes();
    }, []);

    const loadTypes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getSetting('job_types');
            // Handle both array and object response formats
            const types = Array.isArray(response) 
                ? response.map(name => ({ name, fields: [] }))
                : response?.jobTypes?.map((type: JobType) => ({ name: type.name, fields: [] })) || [];
            console.log('Loaded types:', types); // Debug log
            setJobTypes(types);
        } catch (error) {
            console.error('Error loading job types:', error);
            setError('Failed to load job types');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddJobType = async () => {
        if (newJobType.trim()) {
            try {
                const newType: JobTypeConfig = {
                    name: newJobType.trim(),
                    fields: []
                };
                const updatedTypes = [...jobTypes, newType];
                await updateSetting('job_types', updatedTypes);
                await loadTypes();
                setNewJobType('');
            } catch (error) {
                console.error('Error adding job type:', error);
                setError('Failed to add job type');
            }
        }
    };

    const handleDeleteJobType = async (index: number) => {
        try {
            const updatedTypes = jobTypes.filter((_, i) => i !== index);
            await updateSetting('job_types', updatedTypes);
            await loadTypes();
        } catch (error) {
            console.error('Error deleting job type:', error);
            setError('Failed to delete job type');
        }
    };

    const handleEditJobType = async () => {
        if (editingTypeIndex !== null && editValue.trim()) {
            try {
                const updatedTypes = jobTypes.map((type, index) => 
                    index === editingTypeIndex ? { ...type, name: editValue.trim() } : type
                );
                await updateSetting('job_types', updatedTypes);
                await loadTypes();
                setEditingTypeIndex(null);
                setEditValue('');
            } catch (error) {
                console.error('Error updating job type:', error);
                setError('Failed to update job type');
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
                Job Types
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
                Configure the available job types that can be selected when creating jobs
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    label="New Job Type"
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddJobType()}
                    sx={{ width: '300px' }}
                />
                <Button 
                    variant="contained" 
                    onClick={handleAddJobType}
                    disabled={!newJobType.trim()}
                    sx={{ height: '56px', width: '150px' }}
                >
                    Add Type
                </Button>
            </Box>

            <List>
                {jobTypes.map((jobType, index) => (
                    <ListItem 
                        key={index}
                        sx={{ 
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            mb: 1,
                            boxShadow: 1
                        }}
                    >
                        {editingTypeIndex === index ? (
                            <Box sx={{ display: 'flex', gap: 2, flex: 1, alignItems: 'center' }}>
                                <TextField
                                    fullWidth
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleEditJobType()}
                                    sx={{ width: '300px' }}
                                />
                                <Button onClick={handleEditJobType} sx={{ width: '100px' }}>Save</Button>
                                <Button onClick={() => setEditingTypeIndex(null)} sx={{ width: '100px' }}>Cancel</Button>
                            </Box>
                        ) : (
                            <>
                                <ListItemText primary={jobType.name} />
                                <ListItemSecondaryAction>
                                    <IconButton 
                                        edge="end" 
                                        onClick={() => {
                                            setEditingTypeIndex(index);
                                            setEditValue(jobType.name);
                                        }} 
                                        sx={{ mr: 1 }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        edge="end" 
                                        onClick={() => handleDeleteJobType(index)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </>
                        )}
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}
