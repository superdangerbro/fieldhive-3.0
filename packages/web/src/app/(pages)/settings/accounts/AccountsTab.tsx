'use client';

import React from 'react';
import { Box, Paper } from '@mui/material';
import { AccountStatusSection } from './statuses/section';
import { AccountTypeSection } from './types/section';

export function AccountsTab() {
    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Account Types Section */}
            <Paper sx={{ p: 3 }}>
                <AccountTypeSection />
            </Paper>

            {/* Account Status Section */}
            <Paper sx={{ p: 3 }}>
                <AccountStatusSection />
            </Paper>
        </Box>
    );
}
