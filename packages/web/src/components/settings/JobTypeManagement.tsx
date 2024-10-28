'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Alert,
    CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getJobTypes, addJobType, deleteJobType } from '../../services/api';

interface JobType {
    id: string;
    name: string;
}

const JobTypeManagement = () => {
    const [jobTypes, setJobTypes] = useState<JobType[]>([]);
    const [newJobType, setNewJobType] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addingJobType, setAddingJobType] = useState(false);

    const fetchJobTypes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getJobTypes();
            setJobTypes(response.jobTypes);
        } catch (err) {
            setError('Failed to load job types');
            console.error('Error fetching job types:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobTypes();
    }, []);

    const handleAddJobType = async () => {
        if (!newJobType.trim()) return;

        try {
            setAddingJobType(true);
            setError(null);
            const response = await addJobType({ name: newJobType.trim() });
            setJobTypes(prev => [...prev, response]);
            setNewJobType('');
        } catch (err) {
            setError('Failed to add job type');
            console.error('Error adding job type:', err);
        } finally {
            setAddingJobType(false);
        }
    };

    const handleDeleteJobType = async (jobTypeId: string) => {
        try {
            setError(null);
            await deleteJobType(jobTypeId);
            setJobTypes(prev => prev.filter(jobType => jobType.id !== jobTypeId));
        } catch (err) {
            setError('Failed to delete job type');
            console.error('Error deleting job type:', err);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && newJobType.trim()) {
            handleAddJobType();
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Manage Job Types
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                    label="New Job Type"
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value)}
                    onKeyPress={handleKeyPress}
                    size="small"
                    fullWidth
                    disabled={addingJobType}
                />
                <Button
                    onClick={handleAddJobType}
                    variant="contained"
                    disabled={!newJobType.trim() || addingJobType}
                    sx={{ minWidth: 100 }}
                >
                    {addingJobType ? <CircularProgress size={24} /> : 'Add'}
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <List>
                    {jobTypes.map((jobType) => (
                        <ListItem
                            key={jobType.id}
                            sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                mb: 1,
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                            }}
                        >
                            <ListItemText primary={jobType.name} />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleDeleteJobType(jobType.id)}
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            )}

            {!loading && jobTypes.length === 0 && (
                <Typography color="text.secondary" align="center">
                    No job types added yet
                </Typography>
            )}
        </Box>
    );
};

export default JobTypeManagement;
