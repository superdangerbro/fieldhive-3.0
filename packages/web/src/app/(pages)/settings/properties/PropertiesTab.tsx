'use client';

import React from 'react';
import { Box, Paper } from '@mui/material';
import { PropertyStatusSection } from './statuses/section';
import { PropertyTypeSection } from './types/section';

export function PropertiesTab() {
    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Property Types Section */}
            <Paper sx={{ p: 3 }}>
                <PropertyTypeSection />
            </Paper>

            {/* Property Status Section */}
            <Paper sx={{ p: 3 }}>
                <PropertyStatusSection />
            </Paper>
        </Box>
    );
}
