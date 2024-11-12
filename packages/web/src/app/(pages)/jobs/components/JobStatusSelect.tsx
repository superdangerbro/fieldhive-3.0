'use client';

import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    SelectChangeEvent
} from '@mui/material';
import { useSetting } from '../hooks/useSettings';
import { useUpdateJob } from '../hooks/useJobs';

interface JobStatusSelectProps {
    jobId: string;
    currentStatus: string;
}

interface JobStatusResponse {
    statuses: Array<{
        value: string;
        label: string;
        color: string;
    }>;
}

export function JobStatusSelect({ jobId, currentStatus }: JobStatusSelectProps) {
    const { 
        data: response, 
        isLoading: loadingStatuses
    } = useSetting<JobStatusResponse>('job_statuses');
    
    const updateJob = useUpdateJob();
    const statuses = response?.statuses || [];

    const handleStatusChange = (event: SelectChangeEvent<string>) => {
        updateJob.mutateAsync({
            id: jobId,
            data: { status: event.target.value }
        }).catch(error => {
            console.error('Failed to update job status:', error);
        });
    };

    return (
        <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
                value={currentStatus || ''}
                onChange={handleStatusChange}
                label="Status"
                disabled={loadingStatuses}
            >
                {statuses.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                        <Chip 
                            label={status.label}
                            size="small"
                            sx={{ 
                                bgcolor: status.color,
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
