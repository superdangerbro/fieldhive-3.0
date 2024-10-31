'use client';

import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Tabs, Tab, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Divider, Paper, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import type { Property, UpdatePropertyDto, Address, PropertyType, PropertyStatus } from '@fieldhive/shared';
import { deleteProperty, updateProperty, getProperties, getSetting, getAddress } from '../../services/api';
import { StatusChip, formatStatus } from '../common/PropertyStatus';
import dynamic from 'next/dynamic';

const MapDialog = dynamic(() => import('../common/MapDialog'), { ssr: false });

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface PropertyDetailsProps {
  property: Property | null;
  onEdit: (property: Property) => void;
  onUpdate?: () => void;
  onPropertySelect: (property: Property | null) => void;
}

const DEFAULT_STATUSES: PropertyStatus[] = ['active', 'inactive', 'archived', 'pending'];
const DEFAULT_PROPERTY_TYPES: PropertyType[] = ['residential', 'commercial', 'industrial', 'agricultural', 'other'];

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function PropertyDetails({ property, onEdit, onUpdate, onPropertySelect }: PropertyDetailsProps) {
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [typeLoading, setTypeLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState<PropertyStatus[]>(DEFAULT_STATUSES);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>(DEFAULT_PROPERTY_TYPES);
  const [serviceAddress, setServiceAddress] = useState<Address | null>(null);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<any[]>([]);

  useEffect(() => {
    getSetting('property_statuses')
      .then((statuses: PropertyStatus[]) => {
        if (Array.isArray(statuses) && statuses.length > 0) {
          setStatusOptions(statuses);
        }
      })
      .catch((error: Error) => {
        console.error('Failed to fetch property statuses:', error);
      });

    getSetting('property_types')
      .then((types: PropertyType[]) => {
        if (Array.isArray(types) && types.length > 0) {
          setPropertyTypes(types);
        }
      })
      .catch((error: Error) => {
        console.error('Failed to fetch property types:', error);
      });
  }, []);

  useEffect(() => {
    if (property) {
      if (property.service_address_id) {
        getAddress(property.service_address_id)
          .then(address => setServiceAddress(address))
          .catch(error => {
            console.error('Failed to fetch service address:', error);
            setServiceAddress({
              address_id: property.service_address_id!,
              address1: 'Not available',
              city: '',
              province: '',
              postal_code: '',
              country: ''
            });
          });
      } else {
        setServiceAddress(null);
      }
      
      if (property.billing_address_id) {
        getAddress(property.billing_address_id)
          .then(address => setBillingAddress(address))
          .catch(error => {
            console.error('Failed to fetch billing address:', error);
            setBillingAddress({
              address_id: property.billing_address_id!,
              address1: 'Not available',
              city: '',
              province: '',
              postal_code: '',
              country: ''
            });
          });
      } else {
        setBillingAddress(null);
      }
    }
  }, [property]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = () => {
    if (!property) return;
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!property) return;

    try {
      await deleteProperty(property.property_id);
      setDeleteDialogOpen(false);
      onPropertySelect(null);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      setDeleteError(error.message);
    }
  };

  const handleStatusChange = async (event: SelectChangeEvent<string>) => {
    if (!property) return;
    
    setStatusLoading(true);
    try {
      const updatedProperty = await updateProperty(property.property_id, {
        status: event.target.value.toLowerCase() as PropertyStatus
      });
      onPropertySelect(updatedProperty);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleTypeChange = async (event: SelectChangeEvent<string>) => {
    if (!property) return;
    
    setTypeLoading(true);
    try {
      const updatedProperty = await updateProperty(property.property_id, {
        property_type: event.target.value as PropertyType
      });
      onPropertySelect(updatedProperty);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update property type:', error);
    } finally {
      setTypeLoading(false);
    }
  };

  const handleLocationUpdate = async (coordinates: [number, number]) => {
    if (!property) return;
    
    try {
      // Convert [lat, lng] to GeoJSON [lng, lat]
      const geoJsonCoordinates: [number, number] = [coordinates[1], coordinates[0]];
      
      const updatedProperty = await updateProperty(property.property_id, {
        location: {
          type: 'Point',
          coordinates: geoJsonCoordinates
        }
      });
      onPropertySelect(updatedProperty);
      if (onUpdate) {
        onUpdate();
      }
      setMapDialogOpen(false);
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const formatLocation = (location: any) => {
    if (!location || !location.coordinates || !Array.isArray(location.coordinates)) {
      return 'Not set';
    }
    // Display as "latitude, longitude"
    return `${location.coordinates[1].toFixed(6)}, ${location.coordinates[0].toFixed(6)}`;
  };

  const getInitialMapLocation = (): [number, number] | undefined => {
    if (!property?.location?.coordinates) return undefined;
    // Convert GeoJSON [lng, lat] to [lat, lng] for the map
    return [property.location.coordinates[1], property.location.coordinates[0]];
  };

  if (!property) {
    return null;
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                {property.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>Parent Accounts</Typography>
              {linkedAccounts.length > 0 ? (
                <Stack spacing={1}>
                  {linkedAccounts.map(account => (
                    <Paper key={account.id} sx={{ p: 1 }}>
                      <Typography variant="body1">{account.name}</Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No parent accounts
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={property.property_type}
                  onChange={handleTypeChange}
                  label="Type"
                  disabled={typeLoading}
                  sx={{ '& .MuiSelect-select': { py: 1 } }}
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={property.status.toLowerCase()}
                  onChange={handleStatusChange}
                  label="Status"
                  disabled={statusLoading}
                  sx={{ '& .MuiSelect-select': { py: 1 } }}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status.toLowerCase()}>
                      <StatusChip status={formatStatus(status)} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <IconButton onClick={() => onEdit(property)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton 
                  color="error"
                  onClick={handleDeleteClick}
                  sx={{ 
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'error.contrastText'
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Property ID</Typography>
              <Typography variant="body2">{property.property_id}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
              <Typography variant="body2">{new Date(property.created_at).toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">Updated At</Typography>
              <Typography variant="body2">{new Date(property.updated_at).toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                  <Typography variant="body2">
                    {formatLocation(property.location)}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={() => setMapDialogOpen(true)}
                  sx={{ mt: -0.5 }}
                >
                  <LocationOnIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Service Address</Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body1" fontWeight="medium">
                    {serviceAddress?.address1 || 'Not set'}
                  </Typography>
                  {serviceAddress?.address2 && (
                    <Typography variant="body2" color="text.secondary">
                      {serviceAddress.address2}
                    </Typography>
                  )}
                  {(serviceAddress?.city || serviceAddress?.province) && (
                    <Typography variant="body2" color="text.secondary">
                      {[serviceAddress.city, serviceAddress.province].filter(Boolean).join(', ')}
                    </Typography>
                  )}
                  {serviceAddress?.postal_code && (
                    <Typography variant="body2" color="text.secondary">
                      {serviceAddress.postal_code}
                    </Typography>
                  )}
                  {serviceAddress?.country && (
                    <Typography variant="body2" color="text.secondary">
                      {serviceAddress.country}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Billing Address</Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body1" fontWeight="medium">
                    {billingAddress?.address1 || 'Not set'}
                  </Typography>
                  {billingAddress?.address2 && (
                    <Typography variant="body2" color="text.secondary">
                      {billingAddress.address2}
                    </Typography>
                  )}
                  {(billingAddress?.city || billingAddress?.province) && (
                    <Typography variant="body2" color="text.secondary">
                      {[billingAddress.city, billingAddress.province].filter(Boolean).join(', ')}
                    </Typography>
                  )}
                  {billingAddress?.postal_code && (
                    <Typography variant="body2" color="text.secondary">
                      {billingAddress.postal_code}
                    </Typography>
                  )}
                  {billingAddress?.country && (
                    <Typography variant="body2" color="text.secondary">
                      {billingAddress.country}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Jobs" />
              <Tab label="Equipment" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography color="text.secondary">Jobs list will go here</Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography color="text.secondary">Equipment list will go here</Typography>
          </TabPanel>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Property</DialogTitle>
        <DialogContent>
          {deleteError ? (
            <DialogContentText color="error">
              {deleteError}
            </DialogContentText>
          ) : (
            <DialogContentText>
              Are you sure you want to delete this property? This action cannot be undone.
              All associated jobs and equipment will also be deleted.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete Property
          </Button>
        </DialogActions>
      </Dialog>

      {property && (
        <MapDialog
          open={mapDialogOpen}
          onClose={() => setMapDialogOpen(false)}
          initialLocation={getInitialMapLocation()}
          onLocationSelect={handleLocationUpdate}
          mode="marker"
          title="Edit Location"
        />
      )}
    </>
  );
}
