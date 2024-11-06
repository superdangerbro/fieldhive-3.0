'use client';

import React from 'react';
import {
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    CircularProgress
} from '@mui/material';
import type { JobType, JobStatus } from '@/app/globalTypes';
import { useSetting } from '../hooks/useSettings';
import { useJobTypes } from '../hooks/useJobTypes';

interface JobBasicInfoProps {
    title: string;
    status: JobStatus;
    jobTypeId: string | null;
    onTitleChange: (title: string) => void;
    onStatusChange: (status: JobStatus) => void;
    onJobTypeChange: (jobTypeId: string) => void;
}

export function JobBasicInfo({
    title,
    status,
    jobTypeId,
    onTitleChange,
    onStatusChange,
    onJobTypeChange
}: JobBasicInfoProps) {
    // Use React Query for job statuses and types
    const { 
        data: statusOptions = [], 
        isLoading: loadingStatuses,
        error: statusError 
    } = useSetting<JobStatus[]>('job_statuses');

    const {
        data: jobTypes = [],
        isLoading: loadingJobTypes,
        error: jobTypesError
    } = useJobTypes();

    return (
        <>
            <TextField
                label="Title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
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
                            disabled={loadingJobTypes}
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
