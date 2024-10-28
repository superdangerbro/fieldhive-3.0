'use client';

import React from 'react';
import JobTypeManagement from '../../components/settings/JobTypeManagement';
import { Box, Typography } from '@mui/material';

const SettingsPage: React.FC = () => {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Settings
            </Typography>
            <JobTypeManagement />
        </Box>
    );
};

export default SettingsPage;
