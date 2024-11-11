'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Autocomplete,
    TextField,
    CircularProgress,
    Alert,
    Box,
    Chip
} from '@mui/material';
import type { Account } from '../../../globalTypes/account';

interface EditParentAccountsDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
    selectedAccounts: Account[];
    onAccountsChange: (accounts: Account[]) => void;
    availableAccounts: Account[];
    isLoading: boolean;
    error: string | null;
}

export function EditParentAccountsDialog({
    open,
    onClose,
    onSubmit,
    selectedAccounts,
    onAccountsChange,
    availableAccounts,
    isLoading,
    error
}: EditParentAccountsDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            keepMounted={false}
        >
            <DialogTitle>Edit Parent Accounts</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Autocomplete
                        multiple
                        options={availableAccounts}
                        value={selectedAccounts}
                        onChange={(_, newValue) => onAccountsChange(newValue || [])}
                        getOptionLabel={(option) => option.name || ''}
                        loading={isLoading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Parent Accounts"
                                variant="outlined"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {isLoading ? (
                                                <CircularProgress color="inherit" size={20} />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option.name}
                                    {...getTagProps({ index })}
                                    key={option.account_id}
                                />
                            ))
                        }
                        isOptionEqualToValue={(option, value) => 
                            option.account_id === value.account_id
                        }
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onSubmit}
                    variant="contained"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
