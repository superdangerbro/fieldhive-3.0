'use client';

import React from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface PropertyTabsProps {
  tabValue: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export default function PropertyTabs({ tabValue, onTabChange }: PropertyTabsProps) {
  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={onTabChange}>
          <Tab label="Jobs" />
          <Tab label="Equipment" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography color="text.secondary">Jobs list will go here</Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography color="text.secondary">Equipment list will go here</Typography>
      </TabPanel>
    </>
  );
}
