'use client';

import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useEquipmentStore } from './stores/equipmentStore';

export default function EquipmentPage() {
  const { 
    equipment,
    equipmentTypes,
    fetchEquipmentTypes
  } = useEquipmentStore();

  useEffect(() => {
    fetchEquipmentTypes();
  }, [fetchEquipmentTypes]);

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Equipment Management
      </Typography>
      
      {/* Equipment list and management UI will go here */}
    </Box>
  );
}
