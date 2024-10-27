'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import PropertiesTable from '@/components/properties/PropertiesTable';
import PropertiesHeader from '@/components/properties/PropertiesHeader';

export default function PropertiesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <PropertiesHeader onRefresh={handleRefresh} />
      <Box sx={{ mt: 3 }}>
        <PropertiesTable refreshTrigger={refreshTrigger} />
      </Box>
    </Box>
  );
}
