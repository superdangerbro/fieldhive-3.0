'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import JobsHeader from '../../components/jobs/JobsHeader';
import JobsTable from '../../components/jobs/JobsTable';

export default function JobsPage() {
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <JobsHeader />
                <JobsTable />
            </Box>
        </Container>
    );
}
