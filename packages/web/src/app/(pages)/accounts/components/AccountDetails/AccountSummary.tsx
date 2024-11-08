'use client';

import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, IconButton } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import EditIcon from '@mui/icons-material/Edit';
import { EditAccountPropertiesDialog } from '../../dialogs/EditAccountPropertiesDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import type { Account } from '@/app/globalTypes/account';
import type { Property } from '@/app/globalTypes/property';
import type { Job } from '@/app/globalTypes/job';

interface AccountSummaryProps {
    account: Account;
}

export function AccountSummary({ account }: AccountSummaryProps) {
    const queryClient = useQueryClient();
    const { notifySuccess } = useActionNotifications();
    const [isEditingProperties, setIsEditingProperties] = useState(false);
    const propertyCount = account.properties?.length || 0;
    const jobCount = account.jobs?.length || 0;

    const handleEditSuccess = () => {
        console.log('Properties updated successfully');
        setIsEditingProperties(false);
        // Force refetch to ensure data consistency
        queryClient.invalidateQueries({ queryKey: ['account', account.account_id] });
        queryClient.invalidateQueries({ queryKey: ['accounts'] });
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        notifySuccess('Properties updated successfully');
    };

    return (
        <Box sx={{ mt: 3, mb: 4 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6">Properties</Typography>
                                <IconButton 
                                    size="small" 
                                    onClick={() => {
                                        console.log('Opening properties dialog');
                                        setIsEditingProperties(true);
                                    }}
                                    sx={{ ml: 'auto' }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Typography variant="h4" component="div">
                                {propertyCount}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                {account.properties?.map((property: Property) => (
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

                <Grid item xs={12} md={6}>
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
                                {account.jobs?.slice(0, 5).map((job: Job) => (
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
            </Grid>

            <EditAccountPropertiesDialog
                open={isEditingProperties}
                account={account}
                onClose={() => {
                    console.log('Closing properties dialog');
                    setIsEditingProperties(false);
                }}
                onSuccess={handleEditSuccess}
            />
        </Box>
    );
}
