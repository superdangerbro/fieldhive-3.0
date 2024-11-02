'use client';

import React from 'react';
import { Box, Typography, Tabs, Tab, Grid } from '@mui/material';
import type { Job } from '@fieldhive/shared';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface JobTabsProps {
  job: Job;
  tabValue: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

export function JobTabs({ job, tabValue, onTabChange }: JobTabsProps) {
  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={onTabChange}>
          <Tab label="Details" />
          <Tab label="Equipment" />
          <Tab label="History" />
          <Tab label="Notes" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body2">
              {job.description || 'No description provided'}
            </Typography>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography color="text.secondary">
          Equipment list will go here
        </Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography color="text.secondary">
          Job history will go here
        </Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography color="text.secondary">
          Notes will go here
        </Typography>
      </TabPanel>
    </>
  );
}
