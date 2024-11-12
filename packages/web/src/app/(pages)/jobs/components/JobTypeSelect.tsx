'use client';

import React from 'react';
import {
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import { useSetting } from '../hooks/useSettings';
import { useUpdateJob } from '../hooks/useJobs';
import WorkIcon from '@mui/icons-material/Work';

interface JobTypeSelectProps {
    jobId: string;
    currentType: string;
    onUpdate?: () => void;
}

interface JobType {
    value: string;
    label: string;
    fields: any[];
}

export function JobTypeSelect({ jobId, currentType, onUpdate }: JobTypeSelectProps) {
    const { 
        data: types = [], 
        isLoading: loadingTypes
    } = useSetting<JobType[]>('job_types');
    
    const {
        mutate: updateJob,
        isPending: isUpdating
    } = useUpdateJob();

    const handleTypeChange = (event: SelectChangeEvent<string>) => {
        const newType = event.target.value;
        
        updateJob(
            {
                id: jobId,
                data: { job_type_id: newType }
            },
            {
                onSuccess: () => {
                    if (onUpdate) {
                        onUpdate();
                    }
                },
                onError: (error) => {
                    console.error('Failed to update job type:', error);
                }
            }
        );
    };

    return (
        <FormControl fullWidth size="small">
            <Select
                value={currentType || ''}
                onChange={handleTypeChange}
                disabled={isUpdating || loadingTypes}
                startAdornment={
                    loadingTypes ? (
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : (
                        <WorkIcon color="action" sx={{ fontSize: '1.2rem', mr: 1 }} />
                    )
                }
            >
                {types.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{type.label}</Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
