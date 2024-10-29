'use client';

import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import WorkIcon from '@mui/icons-material/Work';
import MapIcon from '@mui/icons-material/Map';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, href: '/' },
    { text: 'Accounts', icon: <GroupIcon />, href: '/accounts' },
    { text: 'Properties', icon: <HomeWorkIcon />, href: '/properties' },
    { text: 'Jobs', icon: <WorkIcon />, href: '/jobs' },
    { text: 'Field Map', icon: <MapIcon />, href: '/field-map' },
    { text: 'Settings', icon: <SettingsIcon />, href: '/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <Box
                component="nav"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    bgcolor: 'background.paper',
                    borderRight: 1,
                    borderColor: 'divider'
                }}
            >
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                component={Link}
                                href={item.href}
                                selected={pathname === item.href}
                                sx={{
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.dark',
                                        color: 'primary.contrastText',
                                        '& .MuiListItemIcon-root': {
                                            color: 'primary.contrastText',
                                        },
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ 
                                    color: pathname === item.href ? 'primary.contrastText' : 'inherit',
                                    minWidth: 40 
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Main content */}
            <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
                {children}
            </Box>
        </Box>
    );
}
