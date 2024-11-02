'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getSetting, updateSetting } from '../../services/api';

interface AccountStatus {
  value: string;
  label: string;
  color: 'success' | 'warning' | 'error' | 'default';
}

interface AccountType {
  value: string;
  label: string;
}

interface AccountSettings {
  statuses: AccountStatus[];
  types: AccountType[];
}

export default function AccountsTab() {
  const [settings, setSettings] = useState<AccountSettings>({
    statuses: [
      { value: 'active', label: 'Active', color: 'success' },
      { value: 'inactive', label: 'Inactive', color: 'warning' },
      { value: 'suspended', label: 'Suspended', color: 'error' }
    ],
    types: [
      { value: 'company', label: 'Company' },
      { value: 'individual', label: 'Individual' }
    ]
  });
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemColor, setNewItemColor] = useState<'success' | 'warning' | 'error' | 'default'>('default');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const accountSettings = await getSetting('account_settings');
      if (accountSettings) {
        setSettings(accountSettings);
      }
    } catch (error) {
      console.error('Failed to load account settings:', error);
    }
  };

  const saveSettings = async (newSettings: AccountSettings) => {
    try {
      await updateSetting('account_settings', newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save account settings:', error);
    }
  };

  const handleAddStatus = () => {
    setEditingItem(null);
    setNewItemValue('');
    setNewItemLabel('');
    setNewItemColor('default');
    setIsStatusDialogOpen(true);
  };

  const handleEditStatus = (status: AccountStatus) => {
    setEditingItem(status);
    setNewItemValue(status.value);
    setNewItemLabel(status.label);
    setNewItemColor(status.color);
    setIsStatusDialogOpen(true);
  };

  const handleSaveStatus = () => {
    const newStatus = {
      value: newItemValue.toLowerCase(),
      label: newItemLabel,
      color: newItemColor
    };

    const newSettings = { ...settings };
    if (editingItem) {
      const index = newSettings.statuses.findIndex(s => s.value === editingItem.value);
      if (index !== -1) {
        newSettings.statuses[index] = newStatus;
      }
    } else {
      newSettings.statuses.push(newStatus);
    }

    saveSettings(newSettings);
    setIsStatusDialogOpen(false);
  };

  const handleAddType = () => {
    setEditingItem(null);
    setNewItemValue('');
    setNewItemLabel('');
    setIsTypeDialogOpen(true);
  };

  const handleEditType = (type: AccountType) => {
    setEditingItem(type);
    setNewItemValue(type.value);
    setNewItemLabel(type.label);
    setIsTypeDialogOpen(true);
  };

  const handleSaveType = () => {
    const newType = {
      value: newItemValue.toLowerCase(),
      label: newItemLabel
    };

    const newSettings = { ...settings };
    if (editingItem) {
      const index = newSettings.types.findIndex(t => t.value === editingItem.value);
      if (index !== -1) {
        newSettings.types[index] = newType;
      }
    } else {
      newSettings.types.push(newType);
    }

    saveSettings(newSettings);
    setIsTypeDialogOpen(false);
  };

  const handleDeleteStatus = (status: AccountStatus) => {
    const newSettings = {
      ...settings,
      statuses: settings.statuses.filter(s => s.value !== status.value)
    };
    saveSettings(newSettings);
  };

  const handleDeleteType = (type: AccountType) => {
    const newSettings = {
      ...settings,
      types: settings.types.filter(t => t.value !== type.value)
    };
    saveSettings(newSettings);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Account Statuses</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddStatus}
                  variant="outlined"
                  size="small"
                >
                  Add Status
                </Button>
              </Box>
              <List>
                {settings.statuses.map((status) => (
                  <ListItem
                    key={status.value}
                    secondaryAction={
                      <Box>
                        <IconButton edge="end" onClick={() => handleEditStatus(status)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteStatus(status)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary">
                            ({status.value})
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Account Types</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddType}
                  variant="outlined"
                  size="small"
                >
                  Add Type
                </Button>
              </Box>
              <List>
                {settings.types.map((type) => (
                  <ListItem
                    key={type.value}
                    secondaryAction={
                      <Box>
                        <IconButton edge="end" onClick={() => handleEditType(type)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteType(type)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography>{type.label}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({type.value})
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={isStatusDialogOpen} onClose={() => setIsStatusDialogOpen(false)}>
        <DialogTitle>{editingItem ? 'Edit Status' : 'Add Status'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Status Value"
            fullWidth
            value={newItemValue}
            onChange={(e) => setNewItemValue(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Display Label"
            fullWidth
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            margin="dense"
            label="Color"
            fullWidth
            value={newItemColor}
            onChange={(e) => setNewItemColor(e.target.value as any)}
            SelectProps={{
              native: true,
            }}
          >
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="default">Default</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveStatus} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isTypeDialogOpen} onClose={() => setIsTypeDialogOpen(false)}>
        <DialogTitle>{editingItem ? 'Edit Type' : 'Add Type'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Type Value"
            fullWidth
            value={newItemValue}
            onChange={(e) => setNewItemValue(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Display Label"
            fullWidth
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsTypeDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveType} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
