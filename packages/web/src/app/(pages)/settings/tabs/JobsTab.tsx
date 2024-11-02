'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getSetting, updateSetting } from '@/services/api';
import type { JobStatus } from '@fieldhive/shared';

const getStatusColor = (status: JobStatus) => {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'in_progress':
            return 'info';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'error';
        default:
            return undefined;
    }
};

export function JobsTab() {
    const [jobTypes, setJobTypes] = useState<string[]>([]);
    const [jobStatuses, setJobStatuses] = useState<JobStatus[]>([]);
    const [newJobType, setNewJobType] = useState('');
    const [newJobStatus, setNewJobStatus] = useState('');
    const [editingTypeIndex, setEditingTypeIndex] = useState<number | null>(null);
    const [editingStatusIndex, setEditingStatusIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const [typesResponse, statusesResponse] = await Promise.all([
                getSetting('job_types'),
                getSetting('job_statuses')
            ]);
            
            // Extract job types from the response
            const types = typesResponse?.jobTypes?.map((type: any) => type.name) || typesResponse || [];
            setJobTypes(types);

            // Set job statuses
            if (Array.isArray(statusesResponse)) {
                setJobStatuses(statusesResponse);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    // Job Types Management
    const handleAddJobType = async () => {
        if (newJobType.trim()) {
            try {
                const updatedTypes = [...jobTypes, newJobType.trim()];
                await updateSetting('job_types', updatedTypes);
                await loadSettings();
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
            await loadSettings();
        } catch (error) {
            console.error('Error deleting job type:', error);
        }
    };

    const startEditingType = (index: number) => {
        setEditingTypeIndex(index);
        setEditValue(jobTypes[index]);
    };

    const handleEditJobType = async () => {
        if (editingTypeIndex !== null && editValue.trim()) {
            try {
                const updatedTypes = jobTypes.map((type, index) => 
                    index === editingTypeIndex ? editValue.trim() : type
                );
                await updateSetting('job_types', updatedTypes);
                await loadSettings();
                setEditingTypeIndex(null);
                setEditValue('');
            } catch (error) {
                console.error('Error updating job type:', error);
            }
        }
    };

    // Job Statuses Management
    const handleAddJobStatus = async () => {
        if (newJobStatus.trim()) {
            try {
                const status = newJobStatus.trim().toLowerCase().replace(/ /g, '_') as JobStatus;
                const updatedStatuses = [...jobStatuses, status];
                await updateSetting('job_statuses', updatedStatuses);
                await loadSettings();
                setNewJobStatus('');
            } catch (error) {
                console.error('Error adding job status:', error);
            }
        }
    };

    const handleDeleteJobStatus = async (index: number) => {
        try {
            const updatedStatuses = jobStatuses.filter((_, i) => i !== index);
            await updateSetting('job_statuses', updatedStatuses);
            await loadSettings();
        } catch (error) {
            console.error('Error deleting job status:', error);
        }
    };

    const startEditingStatus = (index: number) => {
        setEditingStatusIndex(index);
        setEditValue(jobStatuses[index]);
    };

    const handleEditJobStatus = async () => {
        if (editingStatusIndex !== null && editValue.trim()) {
            try {
                const status = editValue.trim().toLowerCase().replace(/ /g, '_') as JobStatus;
                const updatedStatuses = jobStatuses.map((s, index) => 
                    index === editingStatusIndex ? status : s
                );
                await updateSetting('job_statuses', updatedStatuses);
                await loadSettings();
                setEditingStatusIndex(null);
                setEditValue('');
            } catch (error) {
                console.error('Error updating job status:', error);
            }
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* Job Types Section */}
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
                        {editingTypeIndex === index ? (
                            <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                                <TextField
                                    fullWidth
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleEditJobType()}
                                />
                                <Button onClick={handleEditJobType}>Save</Button>
                                <Button onClick={() => setEditingTypeIndex(null)}>Cancel</Button>
                            </Box>
                        ) : (
                            <>
                                <ListItemText primary={jobType} />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={() => startEditingType(index)} sx={{ mr: 1 }}>
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

            <Divider sx={{ my: 4 }} />

            {/* Job Statuses Section */}
            <Typography variant="h6" gutterBottom>
                Manage Job Statuses
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
                Configure the available job statuses that can be assigned to jobs
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    label="New Job Status"
                    value={newJobStatus}
                    onChange={(e) => setNewJobStatus(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddJobStatus()}
                    helperText="Status will be converted to lowercase with underscores (e.g., 'In Progress' becomes 'in_progress')"
                />
                <Button variant="contained" onClick={handleAddJobStatus}>
                    Add Job Status
                </Button>
            </Box>

            <List>
                {jobStatuses.map((status, index) => (
                    <ListItem key={index}>
                        {editingStatusIndex === index ? (
                            <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                                <TextField
                                    fullWidth
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleEditJobStatus()}
                                />
                                <Button onClick={handleEditJobStatus}>Save</Button>
                                <Button onClick={() => setEditingStatusIndex(null)}>Cancel</Button>
                            </Box>
                        ) : (
                            <>
                                <ListItemText 
                                    primary={
                                        <Chip 
                                            label={status.replace('_', ' ').toUpperCase()} 
                                            color={getStatusColor(status)} 
                                            sx={{ color: 'white' }}
                                        />
                                    } 
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" onClick={() => startEditingStatus(index)} sx={{ mr: 1 }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton edge="end" onClick={() => handleDeleteJobStatus(index)}>
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
