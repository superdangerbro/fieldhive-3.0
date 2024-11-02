'use client';

import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import type { Account } from '@fieldhive/shared';
import { PropertiesTab } from './PropertiesTab';
import { JobsTab } from './JobsTab';
import { AddressesTab } from './AddressesTab';

interface AccountTabsProps {
  account: Account;
}

export function AccountTabs({ account }: AccountTabsProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Properties" />
          <Tab label="Jobs" />
          <Tab label="Addresses" />
        </Tabs>
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 0} sx={{ p: 3 }}>
        {tabValue === 0 && <PropertiesTab account={account} />}
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 1} sx={{ p: 3 }}>
        {tabValue === 1 && <JobsTab account={account} />}
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 2} sx={{ p: 3 }}>
        {tabValue === 2 && <AddressesTab account={account} />}
      </Box>
    </>
  );
}
