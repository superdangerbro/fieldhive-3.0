'use client';

import React, { useState } from 'react';
import { Box, Typography, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import type { Account } from '@fieldhive/shared';
import { updateAccount } from '@/services/api';

interface AccountHeaderProps {
  account: Account;
  onUpdate: () => void;
  onDeleteClick: () => void;
}

export function AccountHeader({ account, onUpdate, onDeleteClick }: AccountHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(account.name);
  const [statusLoading, setStatusLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(account.status);
  const [currentType, setCurrentType] = useState(account.type);

  const handleNameSave = async () => {
    if (editedName === account.name) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateAccount(account.account_id, { name: editedName });
      onUpdate();
      setIsEditingName(false);
    } catch (error) {
      console.error('Failed to update name:', error);
      setEditedName(account.name); // Reset on error
    }
  };

  const handleStatusChange = async (event: any) => {
    setStatusLoading(true);
    try {
      await updateAccount(account.account_id, {
        status: event.target.value
      });
      setCurrentStatus(event.target.value);
      onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleTypeChange = async (event: any) => {
    try {
      await updateAccount(account.account_id, {
        type: event.target.value
      });
      setCurrentType(event.target.value);
      onUpdate();
    } catch (error) {
      console.error('Failed to update type:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {isEditingName ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                size="small"
                autoFocus
              />
              <IconButton size="small" onClick={handleNameSave} color="primary">
                <CheckIcon />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => {
                  setIsEditingName(false);
                  setEditedName(account.name);
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          ) : (
            <>
              <Typography variant="h5" component="div">
                {account.name}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setIsEditingName(true)}
                sx={{ ml: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ml: 4 }}>
        <IconButton 
          color="error"
          onClick={onDeleteClick}
          sx={{ 
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.contrastText'
            }
          }}
        >
          <DeleteIcon />
        </IconButton>
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
  );
}
