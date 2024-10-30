'use client';

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddJobDialog from './AddJobDialog';
import { createJob } from '../../services/api';
import { CreateJobDto } from '@fieldhive/shared';

export default function JobsHeader() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOpenAddDialog = () => {
        setIsAddDialogOpen(true);
    };

    const handleCloseAddDialog = () => {
        setIsAddDialogOpen(false);
    };

    const handleAddJob = async (data: CreateJobDto) => {
        try {
            await createJob(data);
            handleCloseAddDialog();
            // Trigger a refresh of the jobs table
            window.dispatchEvent(new CustomEvent('jobsUpdated'));
        } catch (error) {
            console.error('Failed to create job:', error);
            setError('Failed to create job. Please try again.');
        }
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

            <AddJobDialog
                open={isAddDialogOpen}
                onClose={handleCloseAddDialog}
                onSubmit={handleAddJob}
            />
        </Box>
    );
}
