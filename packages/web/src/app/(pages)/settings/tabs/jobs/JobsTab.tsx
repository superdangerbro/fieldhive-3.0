'use client';

import React from 'react';
import { Box, Paper } from '@mui/material';
import { JobTypesSection, JobStatusesSection } from './components';

export function JobsTab() {
    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Job Types Section */}
            <Paper sx={{ p: 3 }}>
                <JobTypesSection />
            </Paper>

            {/* Job Statuses Section */}
            <Paper sx={{ p: 3 }}>
                <JobStatusesSection />
            </Paper>
        </Box>
    );
}
