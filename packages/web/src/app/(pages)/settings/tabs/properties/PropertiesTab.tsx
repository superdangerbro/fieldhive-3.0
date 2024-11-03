'use client';

import React from 'react';
import { Box, Paper } from '@mui/material';
import { PropertyTypesSection, PropertyStatusesSection } from './components';

export function PropertiesTab() {
    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Property Types Section */}
            <Paper sx={{ p: 3 }}>
                <PropertyTypesSection />
            </Paper>

            {/* Property Status Section */}
            <Paper sx={{ p: 3 }}>
                <PropertyStatusesSection />
            </Paper>
        </Box>
    );
}
