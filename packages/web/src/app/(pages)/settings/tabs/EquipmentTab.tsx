'use client';

import React from 'react';
import { Box, Paper } from '@mui/material';
import { EquipmentTypesSection } from './components/EquipmentTypesSection';
import { EquipmentStatusesSection } from './components/EquipmentStatusesSection';

export function EquipmentTab() {
    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Equipment Status Section */}
            <Paper sx={{ p: 3 }}>
                <EquipmentStatusesSection />
            </Paper>

            {/* Equipment Types Section */}
            <Paper sx={{ p: 3 }}>
                <EquipmentTypesSection />
            </Paper>
        </Box>
    );
}
