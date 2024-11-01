import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Tabs, Tab, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Account, Property } from '@fieldhive/shared';
import { updateAccount, deleteAccount, archiveAccount } from '../../services/api';

interface AccountDetailsProps {
  account: Account | null;
  onEdit: (account: Account) => void;
  onUpdate?: () => void;
  onAccountSelect: (account: Account | null) => void;
}

const AccountDetails = ({ account, onEdit, onUpdate, onAccountSelect }: AccountDetailsProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [canArchive, setCanArchive] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(account?.status || 'Active');
  const [currentType, setCurrentType] = useState(account?.type || 'Individual');

  useEffect(() => {
    if (account) {
      setCurrentStatus(account.status || 'Active');
      setCurrentType(account.type || 'Individual');
    }
  }, [account]);

  const handleArchive = async () => {
    if (!account) return;

    try {
      await archiveAccount(account.account_id);
      setDeleteDialogOpen(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      setDeleteError('Failed to archive account');
    }
  };

  const handleConfirmDelete = async () => {
    if (!account) return;

    try {
      await deleteAccount(account.account_id);
      setDeleteDialogOpen(false);
      onAccountSelect(null);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      setDeleteError(error.message);
      setCanArchive(error.canArchive);
    }
  };

  const handleStatusChange = async (event: any) => {
    if (!account) return;
    
    setStatusLoading(true);
    try {
      await updateAccount(account.account_id, {
        status: event.target.value
      });
      setCurrentStatus(event.target.value);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleTypeChange = async (event: any) => {
    if (!account) return;
    
    try {
      await updateAccount(account.account_id, {
        type: event.target.value
      });
      setCurrentType(event.target.value);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update type:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!account) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            Select an account to view details
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" component="div" sx={{ mb: 3 }}>
                {account.name}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Billing Address
                  </Typography>
                  <Typography variant="body2" component="div">
                    {account.billing_address ? (
                      <>
                        {account.billing_address.address1}<br />
                        {account.billing_address.city}, {account.billing_address.province}<br />
                        {account.billing_address.postal_code}
                      </>
                    ) : (
                      'No billing address set'
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Key Contacts
                  </Typography>
                  <Typography variant="body2">Coming soon</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Admin Users
                  </Typography>
                  <Typography variant="body2">Coming soon</Typography>
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ml: 4 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => onEdit(account)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton 
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
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
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentStatus}
                  onChange={handleStatusChange}
                  label="Status"
                  disabled={statusLoading}
                >
                  <MenuItem value="Active">
                    <Chip label="Active" size="small" color="success" sx={{ color: 'white' }} />
                  </MenuItem>
                  <MenuItem value="Inactive">
                    <Chip label="Inactive" size="small" color="warning" sx={{ color: 'white' }} />
                  </MenuItem>
                  <MenuItem value="Archived">
                    <Chip label="Archived" size="small" color="error" sx={{ color: 'white' }} />
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={currentType}
                  onChange={handleTypeChange}
                  label="Type"
                >
                  <MenuItem value="Individual">
                    <Chip label="Individual" size="small" color="info" sx={{ color: 'white' }} />
                  </MenuItem>
                  <MenuItem value="Company">
                    <Chip label="Company" size="small" color="secondary" sx={{ color: 'white' }} />
                  </MenuItem>
                  <MenuItem value="Property Manager">
                    <Chip label="Property Manager" size="small" color="primary" sx={{ color: 'white' }} />
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Properties" />
              <Tab label="Jobs" />
              <Tab label="Addresses" />
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

          <Box role="tabpanel" hidden={tabValue !== 2} sx={{ p: 3 }}>
            {tabValue === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Billing Address
                      </Typography>
                      <Typography variant="body2" color="text.secondary" component="div">
                        {account.billing_address ? (
                          <>
                            {account.billing_address.address1}<br />
                            {account.billing_address.city}, {account.billing_address.province}<br />
                            {account.billing_address.postal_code}
                          </>
                        ) : (
                          'No billing address set'
                        )}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          {deleteError ? (
            <>
              <DialogContentText color="error">
                {deleteError}
              </DialogContentText>
              {canArchive && (
                <DialogContentText sx={{ mt: 2 }}>
                  Would you like to archive this account instead?
                </DialogContentText>
              )}
            </>
          ) : (
            <DialogContentText>
              Are you sure you want to delete this account? This action cannot be undone.
              All associated properties and jobs will also be deleted.
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
                Archive Account
              </Button>
            )
          ) : (
            <Button onClick={handleConfirmDelete} color="error">
              Delete Account
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountDetails;
