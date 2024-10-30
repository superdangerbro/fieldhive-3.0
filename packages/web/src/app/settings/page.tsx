'use client';

import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import EquipmentTab from './EquipmentTab';
import JobsTab from './JobsTab';
import AccountsTab from './AccountsTab';

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
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Equipment" />
          <Tab label="Jobs" />
          <Tab label="Accounts" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <EquipmentTab />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <JobsTab />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <AccountsTab />
      </TabPanel>
    </Box>
  );
}
