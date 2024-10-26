'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AddJobDialog from './AddJobDialog';

interface Job {
    job_id: string;
    job_type: {
        job_type_id: string;
        job_name: string;
    };
    property_id: string;
    created_at: string;
    updated_at: string;
}

export default function JobsHeader() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleOpenAddDialog = () => {
        setIsAddDialogOpen(true);
    };

    const handleCloseAddDialog = () => {
        setIsAddDialogOpen(false);
    };

    const handleAddJob = (data: { property_id: string; job_type_id: string }) => {
        // TODO: Implement job creation logic
        console.log('New job:', data);
        handleCloseAddDialog();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Jobs
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddDialog}
                    sx={{
                        backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
                        textTransform: 'none',
                        px: 3
                    }}
                >
                    Add Job
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                        sx: {
                            backgroundColor: 'rgba(15, 23, 42, 0.6)',
                            '&:hover': {
                                backgroundColor: 'rgba(15, 23, 42, 0.8)'
                            }
                        }
                    }}
                    sx={{
                        maxWidth: 400,
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: 'rgba(148, 163, 184, 0.2)'
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(148, 163, 184, 0.3)'
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'primary.main'
                            }
                        }
                    }}
                />
            </Box>

            <AddJobDialog
                open={isAddDialogOpen}
                onClose={handleCloseAddDialog}
                onSubmit={handleAddJob}
            />
        </Box>
    );
}
