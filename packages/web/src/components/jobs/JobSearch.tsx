'use client';

import React from 'react';
import {
    Box,
    Button,
    Autocomplete,
    TextField,
    Typography,
    Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Job } from '@fieldhive/shared';

interface JobSearchProps {
    jobs: Job[];
    selectedJob: Job | null;
    onJobSelect: (job: Job | null) => void;
    onAddClick: () => void;
}

export default function JobSearch({ jobs, selectedJob, onJobSelect, onAddClick }: JobSearchProps) {
    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Autocomplete
                    fullWidth
                    options={jobs}
                    value={selectedJob}
                    onChange={(_, newValue) => onJobSelect(newValue)}
                    getOptionLabel={(option) => option.title}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Search jobs..."
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    },
                                }
                            }}
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
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    Add Job
                </Button>
            </Box>
        </Paper>
    );
}
