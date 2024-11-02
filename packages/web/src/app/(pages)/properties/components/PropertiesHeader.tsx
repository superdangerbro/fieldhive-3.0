'use client';

import { Box, Typography, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface PropertiesHeaderProps {
  onRefresh: () => void;
}

export default function PropertiesHeader({ onRefresh }: PropertiesHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h4" component="h1">
        Properties
      </Typography>
      <Button
        onClick={onRefresh}
        startIcon={<RefreshIcon />}
        sx={{ ml: 2 }}
      >
        Refresh
      </Button>
    </Box>
  );
}
