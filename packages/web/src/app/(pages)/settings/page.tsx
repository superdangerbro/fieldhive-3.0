'use client';

import { useState, useEffect } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { EquipmentTab, JobsTab, AccountsTab, PropertiesTab } from './tabs';
import { useSearchParams, useRouter } from 'next/navigation';

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

const TAB_NAMES = ['equipment', 'jobs', 'accounts', 'properties'] as const;
type TabName = typeof TAB_NAMES[number];

function getTabIndex(tab: string | null): number {
  if (!tab) return 0;
  const index = TAB_NAMES.indexOf(tab.toLowerCase() as TabName);
  return index === -1 ? 0 : index;
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const [value, setValue] = useState(getTabIndex(tab));

  // Keep value in sync with URL
  useEffect(() => {
    setValue(getTabIndex(tab));
  }, [tab]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    router.replace(`/settings?tab=${TAB_NAMES[newValue]}`);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Equipment" />
          <Tab label="Jobs" />
          <Tab label="Accounts" />
          <Tab label="Properties" />
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
      <TabPanel value={value} index={3}>
        <PropertiesTab />
      </TabPanel>
    </Box>
  );
}
