'use client';

import React from 'react';
import { Typography } from '@mui/material';
import type { Account } from '@fieldhive/shared';

interface JobsTabProps {
  account: Account;
}

export function JobsTab({ account }: JobsTabProps) {
  // TODO: Implement jobs list when jobs by account API is ready
  return (
    <Typography>Jobs list will go here</Typography>
  );
}
