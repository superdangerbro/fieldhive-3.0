'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AddAccountDialog from './AddAccountDialog';
import { Account } from '../../services/mockData';

export default function AccountsHeader() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleOpenAddDialog = () => {
        setIsAddDialogOpen(true);
    };

    const handleCloseAddDialog = () => {
        setIsAddDialogOpen(false);
    };

    const handleAddAccount = (account: Account) => {
        // TODO: Implement account creation logic
        console.log('New account:', account);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Accounts
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddDialog}
                    sx={{
                        backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
                        textTransform: 'none',
                        px: 3
                    }}
                >
                    Add Account
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search accounts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                        sx: {
                            backgroundColor: 'rgba(15, 23, 42, 0.6)',
                            '&:hover': {
                                backgroundColor: 'rgba(15, 23, 42, 0.8)'
                            }
                        }
                    }}
                    sx={{
                        maxWidth: 400,
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderColor: 'rgba(148, 163, 184, 0.2)'
                            },
                            '&:hover fieldset': {
                                borderColor: 'rgba(148, 163, 184, 0.3)'
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'primary.main'
                            }
                        }
                    }}
                />
            </Box>

            <AddAccountDialog 
                open={isAddDialogOpen} 
                onClose={handleCloseAddDialog} 
                onSubmit={handleAddAccount}
            />
        </Box>
    );
}
