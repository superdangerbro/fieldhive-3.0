'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import InventoryIcon from '@mui/icons-material/Inventory';
import type { Account } from 'app/globaltypes';

interface AccountSummaryProps {
  account: Account;
}

export function AccountSummary({ account }: AccountSummaryProps) {
  const propertyCount = account.properties?.length || 0;
  const jobCount = account.jobs?.length || 0;
  const equipmentCount = account.properties?.reduce((total: number, property: any) => 
    total + (property.equipment?.length || 0), 0) || 0;

  return (
    <Box sx={{ mt: 3, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Properties</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {propertyCount}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {account.properties?.map((property: any) => (
                  <Chip 
                    key={property.property_id}
                    label={property.name}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
                {propertyCount === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No properties assigned
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Jobs</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {jobCount}
              </Typography>
              <Box sx={{ mt: 2 }}>
                {account.jobs?.slice(0, 5).map((job: any) => (
                  <Chip 
                    key={job.job_id}
                    label={job.name}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
                {jobCount > 5 && (
                  <Chip 
                    label={`+${jobCount - 5} more`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {jobCount === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No jobs assigned
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Equipment</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {equipmentCount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {equipmentCount === 0 ? 'No equipment assigned' : 'Across all properties'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
