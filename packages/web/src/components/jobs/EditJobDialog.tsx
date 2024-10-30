'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box
} from '@mui/material';
import { Job, JobStatus } from '@fieldhive/shared';
import { updateJob } from '../../services/api';

interface EditJobDialogProps {
    open: boolean;
    job: Job;
    onClose: () => void;
    onSuccess: () => void;
}

const JOB_STATUSES: JobStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];

export default function EditJobDialog({ open, job, onClose, onSuccess }: EditJobDialogProps) {
    const [title, setTitle] = useState(job.title);
    const [status, setStatus] = useState<JobStatus>(job.status);
    const [description, setDescription] = useState(job.description || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setTitle(job.title);
        setStatus(job.status);
        setDescription(job.description || '');
    }, [job]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);
            await updateJob(job.id, { title, status, description });
            onSuccess();
        } catch (error) {
            console.error('Failed to update job:', error);
            setError('Failed to update job. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        select
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as JobStatus)}
                        fullWidth
                    >
                        {JOB_STATUSES.map((status) => (
                            <MenuItem key={status} value={status}>
                                {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}
