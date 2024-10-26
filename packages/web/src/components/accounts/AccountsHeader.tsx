'use client';

import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddAccountDialog from './AddAccountDialog';

interface AccountsHeaderProps {
    onAccountCreated: () => void;
}

export default function AccountsHeader({ onAccountCreated }: AccountsHeaderProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const handleOpenAddDialog = () => {
        setIsAddDialogOpen(true);
    };

    const handleCloseAddDialog = () => {
        setIsAddDialogOpen(false);
    };

    const handleSuccess = () => {
        onAccountCreated();
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

            <AddAccountDialog
                open={isAddDialogOpen}
                onClose={handleCloseAddDialog}
                onSuccess={handleSuccess}
            />
        </Box>
    );
}
