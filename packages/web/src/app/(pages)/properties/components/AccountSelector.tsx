'use client';

import React, { useState, useEffect } from 'react';
import { 
    Autocomplete, 
    TextField, 
    Chip,
    CircularProgress
} from '@mui/material';
import { useAccounts } from '../hooks/useAccounts';
import type { Account } from '../../../globalTypes/account';

interface AccountSelectorProps {
    selectedAccounts: Account[];
    onChange: (accounts: Account[]) => void;
    disabled?: boolean;
}

export default function AccountSelector({ selectedAccounts, onChange, disabled }: AccountSelectorProps) {
    const [inputValue, setInputValue] = useState('');
    
    // Use React Query for accounts data
    const { 
        data: accounts = [], 
        isLoading: loading,
        error: queryError,
        refetch
    } = useAccounts({ 
        search: inputValue || undefined,
        limit: 100
    });

    // Debounced search
    useEffect(() => {
        if (!inputValue) return;

        const debounceTimer = setTimeout(() => {
            refetch();
        }, 300);

        return () => {
            clearTimeout(debounceTimer);
        };
    }, [inputValue, refetch]);

    const error = queryError instanceof Error ? queryError.message : null;

    return (
        <Autocomplete
            multiple
            value={selectedAccounts}
            onChange={(_, newValue) => onChange(newValue)}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            options={accounts}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.account_id === value.account_id}
            loading={loading}
            disabled={disabled}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Parent Accounts"
                    error={!!error}
                    helperText={error}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
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
            filterOptions={(options) => {
                // No need for client-side filtering since we're using server-side search
                return options;
            }}
        />
    );
}
