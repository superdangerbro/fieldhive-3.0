'use client';

import React from 'react';
import { Box, Paper } from '@mui/material';
import { JobStatusSection } from './statuses/section';
import { JobTypeSection } from './types/section';

export function JobsTab() {
    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Job Types Section */}
            <Paper sx={{ p: 3 }}>
                <JobTypeSection />
            </Paper>

            {/* Job Status Section */}
            <Paper sx={{ p: 3 }}>
                <JobStatusSection />
            </Paper>
        </Box>
    );
}
