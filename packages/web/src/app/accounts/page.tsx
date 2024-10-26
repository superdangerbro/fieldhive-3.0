'use client';

import React, { useState, useCallback } from 'react';
import { Box, Container } from '@mui/material';
import AccountsHeader from '../../components/accounts/AccountsHeader';
import AccountsTable from '../../components/accounts/AccountsTable';
import { getAccounts } from '@/services/api';

export default function AccountsPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleAccountCreated = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <AccountsHeader onAccountCreated={handleAccountCreated} />
                <AccountsTable refreshTrigger={refreshTrigger} />
            </Box>
        </Container>
    );
}
