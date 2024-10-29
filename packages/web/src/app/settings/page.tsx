'use client';

import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import JobsTab from './JobsTab';
import EquipmentTab from './EquipmentTab';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function SettingsPage() {
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Settings
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                    <Tab label="Jobs" />
                    <Tab label="Field Equipment" />
                </Tabs>
            </Box>
            <TabPanel value={currentTab} index={0}>
                <JobsTab />
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
                <EquipmentTab />
            </TabPanel>
        </Box>
    );
}
