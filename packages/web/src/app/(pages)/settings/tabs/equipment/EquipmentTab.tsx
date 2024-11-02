'use client';

import React from 'react';
import { Box, Paper } from '@mui/material';
import { EquipmentTypesSection, EquipmentStatusesSection } from './components';

export function EquipmentTab() {
    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Equipment Types Section */}
            <Paper sx={{ p: 3 }}>
                <EquipmentTypesSection />
            </Paper>

            {/* Equipment Status Section */}
            <Paper sx={{ p: 3 }}>
                <EquipmentStatusesSection />
            </Paper>
        </Box>
    );
}
