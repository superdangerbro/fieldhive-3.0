'use client';

import React from 'react';
import { Paper, Typography, Box, IconButton, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface DashboardWidgetProps {
    title: string;
    tooltip?: string;
    children: React.ReactNode;
    minHeight?: number | string;
}

export default function DashboardWidget({
    title,
    tooltip,
    children,
    minHeight = 300
}: DashboardWidgetProps) {
    return (
        <Paper
            sx={{
                p: 3,
                height: '100%',
                minHeight,
                display: 'flex',
                flexDirection: 'column',
                backgroundImage: 'linear-gradient(to bottom right, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.8))',
                backdropFilter: 'blur(12px)',
                borderRadius: 3,
                border: '1px solid rgba(148, 163, 184, 0.1)'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        flexGrow: 1
                    }}
                >
                    {title}
                </Typography>
                {tooltip && (
                    <Tooltip title={tooltip} arrow placement="top">
                        <IconButton
                            size="small"
                            sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                    color: 'text.primary'
                                }
                            }}
                        >
                            <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </Box>
        </Paper>
    );
}
