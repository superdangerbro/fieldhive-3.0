'use client';

import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Tabs, Tab, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Property } from '@fieldhive/shared';
import { deleteProperty, archiveProperty, updateProperty } from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

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

interface PropertyDetailsProps {
  property: Property | null;
  onEdit: (property: Property) => void;
  onUpdate?: () => void;
  onPropertySelect: (property: Property | null) => void;
}

const STATUS_OPTIONS = ['Active', 'Inactive', 'Archived'];

export default function PropertyDetails({ property, onEdit, onUpdate, onPropertySelect }: PropertyDetailsProps) {
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [canArchive, setCanArchive] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = () => {
    if (!property) return;
    setDeleteError(null);
    setCanArchive(false);
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
      setCanArchive(error.canArchive);
    }
  };

  const handleArchive = async () => {
    if (!property) return;

    try {
      await archiveProperty(property.property_id);
      setDeleteDialogOpen(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      setDeleteError('Failed to archive property');
    }
  };

  const handleStatusChange = async (event: any) => {
    if (!property) return;
    
    setStatusLoading(true);
    try {
      await updateProperty(property.property_id, {
        status: event.target.value
      });
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  // Capitalize first letter of status
  const getDisplayStatus = (status: string | undefined) => {
    if (!status) return 'Active';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  if (!property) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            Select a property to view details
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" component="div" gutterBottom>
                {property.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={getDisplayStatus(property.status)}
                    onChange={handleStatusChange}
                    label="Status"
                    disabled={statusLoading}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        <Chip 
                          label={status}
                          size="small"
                          color={status === 'Active' ? 'success' : 
                                status === 'Inactive' ? 'warning' : 
                                status === 'Archived' ? 'error' : 'default'}
                          sx={{ pointerEvents: 'none' }}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
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

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Jobs" />
              <Tab label="Equipment" />
              <Tab label="Addresses" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography color="text.secondary">Jobs list will go here</Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography color="text.secondary">Equipment list will go here</Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">Billing Address</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {property.billing_address ? (
                        <>
                          {property.billing_address.address1}<br />
                          {property.billing_address.city}, {property.billing_address.province}<br />
                          {property.billing_address.postal_code}
                        </>
                      ) : (
                        'No billing address set'
                      )}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">Service Address</Typography>
                    <Typography variant="body2" color="text.secondary">
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
            </Grid>
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
            <>
              <DialogContentText color="error">
                {deleteError}
              </DialogContentText>
              {canArchive && (
                <DialogContentText sx={{ mt: 2 }}>
                  Would you like to archive this property instead?
                </DialogContentText>
              )}
            </>
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
          {deleteError ? (
            canArchive && (
              <Button onClick={handleArchive} color="warning">
                Archive Property
              </Button>
            )
          ) : (
            <Button onClick={handleConfirmDelete} color="error">
              Delete Property
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
