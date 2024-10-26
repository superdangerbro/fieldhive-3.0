'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import AccountsHeader from '../../components/accounts/AccountsHeader';
import AccountsTable from '../../components/accounts/AccountsTable';

export default function AccountsPage() {
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <AccountsHeader />
                <AccountsTable />
            </Box>
        </Container>
    );
}
