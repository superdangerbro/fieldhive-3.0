'use client';

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
    message?: string;
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: 'background.default',
                gap: 2
            }}
        >
            <CircularProgress
                size={40}
                thickness={4}
                sx={{
                    color: 'primary.main'
                }}
            />
            <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                    mt: 2,
                    fontWeight: 500
                }}
            >
                {message}
            </Typography>
        </Box>
    );
}
