'use client';

import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import MapIcon from '@mui/icons-material/Map';
import SettingsIcon from '@mui/icons-material/Settings';

const features = [
    {
        icon: <DashboardIcon sx={{ fontSize: 40 }} />,
        title: 'Dashboard',
        description: 'Get a comprehensive overview of your field operations and equipment status.',
        path: '/dashboard'
    },
    {
        icon: <BusinessIcon sx={{ fontSize: 40 }} />,
        title: 'Accounts',
        description: 'Manage your business accounts and client relationships.',
        path: '/accounts'
    },
    {
        icon: <MapIcon sx={{ fontSize: 40 }} />,
        title: 'Field Map',
        description: 'View and manage your equipment locations in real-time.',
        path: '/field-map'
    },
    {
        icon: <SettingsIcon sx={{ fontSize: 40 }} />,
        title: 'Settings',
        description: 'Configure your system preferences and user settings.',
        path: '/settings'
    }
];

export default function HomePage() {
    const router = useRouter();

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pt: 8 }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="h2"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            mb: 2,
                            background: 'linear-gradient(45deg, #6366f1 30%, #ec4899 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Welcome to FieldHive
                    </Typography>
                    <Typography
                        variant="h5"
                        color="text.secondary"
                        sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}
                    >
                        Your comprehensive solution for field equipment management and monitoring
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {features.map((feature) => (
                        <Grid item xs={12} sm={6} md={3} key={feature.title}>
                            <Paper
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)'
                                    }
                                }}
                                onClick={() => router.push(feature.path)}
                            >
                                <Box
                                    sx={{
                                        mb: 2,
                                        color: 'primary.main',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {feature.icon}
                                </Box>
                                <Typography variant="h6" component="h2" gutterBottom>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                                    {feature.description}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(feature.path);
                                    }}
                                >
                                    Learn More
                                </Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
