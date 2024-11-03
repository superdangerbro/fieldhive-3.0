'use client';

import React, { useState, useEffect } from 'react';
import {
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    CircularProgress,
    Box
} from '@mui/material';
import { getSetting } from '@/services/api';
import type { JobType } from '../types';

interface JobStatus {
    name: string;
    color: string;
}

interface JobBasicInfoProps {
    title: string;
    status: JobStatus;
    jobTypeId: string | null;
    jobTypes: JobType[];
    loadingJobTypes: boolean;
    onTitleChange: (title: string) => void;
    onStatusChange: (status: JobStatus) => void;
    onJobTypeChange: (jobTypeId: string) => void;
}

export function JobBasicInfo({
    title,
    status,
    jobTypeId,
    jobTypes,
    loadingJobTypes,
    onTitleChange,
    onStatusChange,
    onJobTypeChange
}: JobBasicInfoProps) {
    const [statusOptions, setStatusOptions] = useState<JobStatus[]>([]);
    const [loadingStatuses, setLoadingStatuses] = useState(true);

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                setLoadingStatuses(true);
                const statuses = await getSetting('job_statuses');
                if (Array.isArray(statuses)) {
                    setStatusOptions(statuses);
                }
            } catch (error) {
                console.error('Failed to fetch job statuses:', error);
                setStatusOptions([]);
            } finally {
                setLoadingStatuses(false);
            }
        };

        fetchStatuses();
    }, []);

    return (
        <>
            <TextField
                label="Title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                fullWidth
            />

            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status.name}
                            onChange={(e) => {
                                const newStatus = statusOptions.find(s => s.name === e.target.value);
                                if (newStatus) {
                                    onStatusChange(newStatus);
                                }
                            }}
                            label="Status"
                            disabled={loadingStatuses}
                            startAdornment={
                                loadingStatuses ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                                        <CircularProgress size={20} />
                                    </Box>
                                ) : null
                            }
                        >
                            {statusOptions.map((status) => (
                                <MenuItem key={status.name} value={status.name}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                borderRadius: 1,
                                                bgcolor: status.color,
                                                mr: 1
                                            }}
                                        />
                                        {status.name}
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <InputLabel>Job Type</InputLabel>
                        <Select
                            value={jobTypeId || ''}
                            onChange={(e) => onJobTypeChange(e.target.value)}
                            label="Job Type"
                            disabled={loadingJobTypes || jobTypes.length === 0}
                            startAdornment={
                                loadingJobTypes ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                                        <CircularProgress size={20} />
                                    </Box>
                                ) : null
                            }
                        >
                            {jobTypes.length === 0 && !loadingJobTypes ? (
                                <MenuItem value="" disabled>
                                    <em>No job types available</em>
                                </MenuItem>
                            ) : (
                                jobTypes.map((type) => (
                                    <MenuItem key={type.job_type_id} value={type.job_type_id}>
                                        {type.name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </>
    );
}
