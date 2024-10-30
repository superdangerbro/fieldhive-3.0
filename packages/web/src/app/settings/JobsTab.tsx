'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getSetting, updateSetting } from '../../services/api';

export default function JobsTab() {
    const [jobTypes, setJobTypes] = useState<string[]>([]);
    const [newJobType, setNewJobType] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        loadJobTypes();
    }, []);

    const loadJobTypes = async () => {
        try {
            const response = await getSetting('job_types');
            // Extract job types from the response
            const types = response?.jobTypes?.map((type: any) => type.name) || response || [];
            setJobTypes(types);
        } catch (error) {
            console.error('Error loading job types:', error);
        }
    };

    const handleAddJobType = async () => {
        if (newJobType.trim()) {
            try {
                const updatedTypes = [...jobTypes, newJobType.trim()];
                await updateSetting('job_types', updatedTypes);
                await loadJobTypes();
                setNewJobType('');
            } catch (error) {
                console.error('Error adding job type:', error);
            }
        }
    };

    const handleDeleteJobType = async (index: number) => {
        try {
            const updatedTypes = jobTypes.filter((_, i) => i !== index);
            await updateSetting('job_types', updatedTypes);
            await loadJobTypes();
        } catch (error) {
            console.error('Error deleting job type:', error);
        }
    };

    const startEditing = (index: number) => {
        setEditingIndex(index);
        setEditValue(jobTypes[index]);
    };

    const handleEditJobType = async () => {
        if (editingIndex !== null && editValue.trim()) {
            try {
                const updatedTypes = jobTypes.map((type, index) => 
                    index === editingIndex ? editValue.trim() : type
                );
                await updateSetting('job_types', updatedTypes);
                await loadJobTypes();
                setEditingIndex(null);
                setEditValue('');
            } catch (error) {
                console.error('Error updating job type:', error);
            }
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Manage Job Types
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
                Configure the available job types that can be selected when creating jobs
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    label="New Job Type"
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddJobType()}
                />
                <Button variant="contained" onClick={handleAddJobType}>
                    Add Job Type
                </Button>
            </Box>

            <List>
                {jobTypes.map((jobType, index) => (
                    <ListItem key={index}>
                        {editingIndex === index ? (
                            <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                                <TextField
                                    fullWidth
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleEditJobType()}
                                />
                                <Button onClick={handleEditJobType}>Save</Button>
                                <Button onClick={() => setEditingIndex(null)}>Cancel</Button>
                            </Box>
                        ) : (
                            <>
                                <ListItemText primary={jobType} />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={() => startEditing(index)} sx={{ mr: 1 }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" onClick={() => handleDeleteJobType(index)}>
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
