'use client';

import React from 'react';
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
import { JobStatus } from '@fieldhive/shared';

interface JobType {
    job_type_id: string;
    name: string;
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

const JOB_STATUSES: JobStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];

export default function JobBasicInfo({
    title,
    status,
    jobTypeId,
    jobTypes,
    loadingJobTypes,
    onTitleChange,
    onStatusChange,
    onJobTypeChange
}: JobBasicInfoProps) {
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
                            value={status}
                            onChange={(e) => onStatusChange(e.target.value as JobStatus)}
                            label="Status"
                        >
                            {JOB_STATUSES.map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
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
