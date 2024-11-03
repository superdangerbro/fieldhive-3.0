'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { usePropertyTypes, PropertyType } from './store';

export function PropertyTypeSection() {
    const { types, isLoading, error, fetch, update } = usePropertyTypes();
    const [newType, setNewType] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        fetch();
    }, [fetch]);

    const handleAddType = async () => {
        if (newType.trim()) {
            const newTypeConfig: PropertyType = {
                name: newType.trim(),
                fields: []
            };
            await update([...types, newTypeConfig]);
            setNewType('');
        }
    };

    const handleDeleteType = async (index: number) => {
        const updatedTypes = types.filter((_: PropertyType, i: number) => i !== index);
        await update(updatedTypes);
    };

    const handleEditType = async () => {
        if (editingIndex !== null && editValue.trim()) {
            const updatedTypes = types.map((type: PropertyType, index: number) => 
                index === editingIndex ? {
                    ...type,
                    name: editValue.trim()
                } : type
            );
            await update(updatedTypes);
            setEditingIndex(null);
            setEditValue('');
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2, color: 'error.main' }}>
                <Typography>{error}</Typography>
                <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={fetch}
                    sx={{ mt: 1 }}
                >
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Property Types
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Configure the available property types that can be assigned to properties
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    placeholder="New Property Type"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddType()}
                    sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        }
                    }}
                />
                <Button 
                    variant="contained" 
                    onClick={handleAddType}
                    disabled={!newType.trim()}
                    sx={{ 
                        bgcolor: 'primary.main',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                        }
                    }}
                >
                    Add Type
                </Button>
            </Box>

            <List>
                {types.map((type: PropertyType, index: number) => (
                    <ListItem 
                        key={index}
                        sx={{ 
                            p: 1,
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        {editingIndex === index ? (
                            <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                                <TextField
                                    fullWidth
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleEditType()}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        }
                                    }}
                                />
                                <Button onClick={handleEditType}>Save</Button>
                                <Button onClick={() => {
                                    setEditingIndex(null);
                                    setEditValue('');
                                }}>Cancel</Button>
                            </Box>
                        ) : (
                            <>
                                <ListItemText 
                                    primary={type.name}
                                    secondary={`${type.fields.length} fields configured`}
                                />
                                <IconButton onClick={() => {
                                    setEditingIndex(index);
                                    setEditValue(type.name);
                                }}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDeleteType(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        )}
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}
