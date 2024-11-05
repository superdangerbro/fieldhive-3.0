'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useUpdateProperty } from '../hooks/useProperties';

interface InlinePropertyNameProps {
  propertyId: string;
  initialName: string;
  onUpdate?: () => void;
}

export default function InlinePropertyName({ propertyId, initialName, onUpdate }: InlinePropertyNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [previousName, setPreviousName] = useState(initialName);

  const { mutate: updateProperty, isPending } = useUpdateProperty();

  // Update state when initialName changes
  useEffect(() => {
    setName(initialName);
    setPreviousName(initialName);
  }, [initialName]);

  const handleEdit = () => {
    setPreviousName(name);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(previousName);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (name.trim() && name !== previousName) {
      updateProperty(
        { id: propertyId, data: { name: name.trim() } },
        {
          onSuccess: () => {
            setIsEditing(false);
            if (onUpdate) onUpdate();
          }
        }
      );
    } else {
      handleCancel();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {isEditing ? (
        <>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyPress}
            size="small"
            autoFocus
            disabled={isPending}
            sx={{ minWidth: 200 }}
          />
          <IconButton 
            onClick={handleSave} 
            color="primary" 
            size="small"
            disabled={isPending}
          >
            <CheckIcon />
          </IconButton>
          <IconButton 
            onClick={handleCancel} 
            color="default" 
            size="small"
            disabled={isPending}
          >
            <CloseIcon />
          </IconButton>
        </>
      ) : (
        <>
          <Typography variant="h5" component="div">
            {name}
          </Typography>
          <IconButton onClick={handleEdit} color="primary" size="small">
            <EditIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
}
