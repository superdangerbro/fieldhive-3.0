'use client';

import React from 'react';
import { Box, Paper } from '@mui/material';
import { AccountStatusesSection, AccountTypesSection } from './components';

export function AccountsTab() {
    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Account Types Section */}
            <Paper sx={{ p: 3 }}>
                <AccountTypesSection />
            </Paper>

            {/* Account Status Section */}
            <Paper sx={{ p: 3 }}>
                <AccountStatusesSection />
            </Paper>
        </Box>
    );
}
