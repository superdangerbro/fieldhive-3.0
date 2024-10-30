'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

export default function JobsHeader() {
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                    Jobs
                </Typography>
            </Box>
        </Box>
    );
}
