'use client';

import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import type { Account, Property } from '@fieldhive/shared';

interface PropertiesTabProps {
  account: Account;
}

export function PropertiesTab({ account }: PropertiesTabProps) {
  return (
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
  );
}
