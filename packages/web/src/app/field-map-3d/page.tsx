'use client';

import FieldMap3D from './components/FieldMap3D';
import DashboardLayout from '../../components/common/DashboardLayout';
import { Box } from '@mui/material';

export default function FieldMap3DPage() {
  return (
    <DashboardLayout>
      <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
        <FieldMap3D />
      </Box>
    </DashboardLayout>
  );
}
