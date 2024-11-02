'use client';

import React from 'react';
import {
    Box,
    Button,
    Autocomplete,
    TextField,
    Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Job } from '@fieldhive/shared';

interface JobSearchProps {
    jobs: Job[];
    selectedJob: Job | null;
    onJobSelect: (job: Job | null) => void;
    onAddClick: () => void;
}

export function JobSearch({ jobs, selectedJob, onJobSelect, onAddClick }: JobSearchProps) {
    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Autocomplete
                sx={{ flexGrow: 1 }}
                options={jobs}
                value={selectedJob}
                onChange={(_, newValue) => onJobSelect(newValue)}
                getOptionLabel={(option) => option.title}
                isOptionEqualToValue={(option, value) => option.job_id === value.job_id}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search Jobs"
                        placeholder="Type to search..."
                    />
                )}
                renderOption={(props, option) => (
                    <li {...props}>
                        <Box>
                            <Typography variant="body1">{option.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {option.property?.name} - {option.status}
                            </Typography>
                        </Box>
                    </li>
                )}
            />
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAddClick}
                sx={{
                    backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
                    textTransform: 'none'
                }}
            >
                Add Job
            </Button>
        </Box>
    );
}
