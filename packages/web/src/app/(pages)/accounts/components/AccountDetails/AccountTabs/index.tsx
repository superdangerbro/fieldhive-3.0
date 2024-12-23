'use client';

import React, { useState } from 'react';
import { Box, Tabs, Tab, Card, CardContent, Typography, Grid } from '@mui/material';
import type { Account, Property } from '@fieldhive/shared';

interface AccountTabsProps {
  account: Account;
}

export function AccountTabs({ account }: AccountTabsProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Properties" />
          <Tab label="Jobs" />
        </Tabs>
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 0} sx={{ p: 3 }}>
        {tabValue === 0 && (
          <Box>
            {account.properties?.length ? (
              <Grid container spacing={2}>
                {account.properties.map((property: Property) => (
                  <Grid item xs={12} key={property.property_id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">{property.name}</Typography>
                        <Typography variant="body2" color="text.secondary" component="div">
                          {property.service_address ? (
                            <>
                              {property.service_address.address1}<br />
                              {property.service_address.city}, {property.service_address.province}<br />
                              {property.service_address.postal_code}
                            </>
                          ) : (
                            'No service address set'
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No properties associated with this account</Typography>
            )}
          </Box>
        )}
      </Box>

      <Box role="tabpanel" hidden={tabValue !== 1} sx={{ p: 3 }}>
        {tabValue === 1 && (
          <Typography>Jobs list will go here</Typography>
        )}
      </Box>
    </Box>
  );
}
