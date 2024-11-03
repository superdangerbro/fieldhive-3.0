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
import { useAccountTypes, AccountType } from './store';

export function AccountTypeSection() {
    const { types, isLoading, error, fetch, update } = useAccountTypes();
    const [newType, setNewType] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        fetch();
    }, [fetch]);

    const handleAddType = async () => {
        if (newType.trim()) {
            const newTypeConfig: AccountType = {
                value: newType.trim().toLowerCase(),
                label: newType.trim()
            };
            await update([...types, newTypeConfig]);
            setNewType('');
        }
    };

    const handleDeleteType = async (index: number) => {
        const updatedTypes = types.filter((_, i) => i !== index);
        await update(updatedTypes);
    };

    const handleEditType = async () => {
        if (editingIndex !== null && editValue.trim()) {
            const updatedTypes = types.map((type, index) => 
                index === editingIndex ? {
                    value: editValue.trim().toLowerCase(),
                    label: editValue.trim()
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
                Account Types
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Configure the available account types that can be assigned to accounts
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    placeholder="New Account Type"
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
                {types.map((type, index) => (
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
                                <ListItemText primary={type.label} />
                                <IconButton onClick={() => {
                                    setEditingIndex(index);
                                    setEditValue(type.label);
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
