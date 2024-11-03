'use client';

import React from 'react';
import { Box, Paper } from '@mui/material';
import { EquipmentStatusSection } from './statuses/section';
import { EquipmentTypeSection } from './types/section';

export function EquipmentTab() {
    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Equipment Types Section */}
            <Paper sx={{ p: 3 }}>
                <EquipmentTypeSection />
            </Paper>

            {/* Equipment Status Section */}
            <Paper sx={{ p: 3 }}>
                <EquipmentStatusSection />
            </Paper>
        </Box>
    );
}
