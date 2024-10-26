'use client';

import React, { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

function Loading() {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: 'background.default'
            }}
        >
            <CircularProgress />
        </Box>
    );
}

export default function AccountsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<Loading />}>
            {children}
        </Suspense>
    );
}
