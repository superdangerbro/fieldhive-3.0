'use client';

import React from 'react';
import { 
    Grid, 
    Typography, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    SelectChangeEvent,
    CircularProgress,
    Box,
    Paper,
    Stack,
    Skeleton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import type { Property } from '../../../globalTypes/property';
import { StatusChip, formatStatus } from './PropertyStatus';
import PropertyParentAccounts from './PropertyParentAccounts';

interface PropertyMetadataProps {
    property: Property;
    propertyTypes: Array<{ value: string; label: string }>;
    statusOptions: Array<{ value: string; label: string; color?: string }>;
    typeLoading: boolean;
    statusLoading: boolean;
    onTypeChange: (event: SelectChangeEvent<string>) => void;
    onStatusChange: (event: SelectChangeEvent<string>) => void;
    onUpdate: () => void;
}

export default function PropertyMetadata({ 
    property,
    propertyTypes = [],
    statusOptions = [],
    typeLoading = false,
    statusLoading = false,
    onTypeChange,
    onStatusChange,
    onUpdate
}: PropertyMetadataProps) {
    if (!property) {
        return null;
    }

    const isLoading = typeLoading || statusLoading;

    return (
        <Grid container spacing={3}>
            {/* Left Column - Parent Accounts */}
            <Grid item xs={12} md={6}>
                <Paper 
                    elevation={1}
                    sx={{ 
                        p: 2, 
                        height: '100%',
                        minHeight: '300px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <PropertyParentAccounts 
                        property={property}
                        onUpdate={onUpdate}
                    />
                </Paper>
            </Grid>

            {/* Right Column - Property Details and Timestamps */}
            <Grid item xs={12} md={6}>
                <Paper 
                    elevation={1}
                    sx={{ 
                        p: 2, 
                        height: '100%',
                        minHeight: '300px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">
                            Property Details
                        </Typography>
                    </Box>
                    <Stack spacing={2} sx={{ flex: 1 }}>
                        {isLoading ? (
                            <>
                                <Skeleton height={56} />
                                <Skeleton height={56} />
                            </>
                        ) : (
                            <>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        value={property.type || ''}
                                        onChange={onTypeChange}
                                        label="Type"
                                        disabled={typeLoading}
                                        sx={{ '& .MuiSelect-select': { py: 1 } }}
                                    >
                                        {propertyTypes.map((type) => (
                                            <MenuItem key={type.value} value={type.value}>
                                                {type.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={property.status || ''}
                                        onChange={onStatusChange}
                                        label="Status"
                                        disabled={statusLoading}
                                        sx={{ '& .MuiSelect-select': { py: 1 } }}
                                    >
                                        {statusOptions.map((status) => (
                                            <MenuItem key={status.value} value={status.value}>
                                                <StatusChip status={formatStatus(status.value)} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </>
                        )}

                        <Box sx={{ mt: 'auto', pt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Created At
                            </Typography>
                            <Typography variant="body1">
                                {property.created_at ? new Date(property.created_at).toLocaleString() : 'N/A'}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                Updated At
                            </Typography>
                            <Typography variant="body1">
                                {property.updated_at ? new Date(property.updated_at).toLocaleString() : 'N/A'}
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>
            </Grid>
        </Grid>
    );
}
