'use client';

import React, { useState, useEffect } from 'react';
import { 
    Autocomplete, 
    TextField, 
    Chip,
    CircularProgress
} from '@mui/material';
import { getAccounts } from '../../services/api';

export interface MinimalAccount {
    account_id: string;
    name: string;
}

interface AccountSelectorProps {
    selectedAccounts: MinimalAccount[];
    onChange: (accounts: MinimalAccount[]) => void;
    disabled?: boolean;
}

export default function AccountSelector({ selectedAccounts, onChange, disabled }: AccountSelectorProps) {
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState<MinimalAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load initial accounts
    useEffect(() => {
        let active = true;

        const loadAccounts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getAccounts({ 
                    limit: 100,
                    minimal: true
                });
                if (active) {
                    setOptions(response.accounts);
                }
            } catch (error) {
                console.error('Failed to fetch accounts:', error);
                setError('Failed to load accounts');
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadAccounts();

        return () => {
            active = false;
        };
    }, []);

    // Handle search
    useEffect(() => {
        let active = true;

        if (inputValue === '') {
            return;
        }

        const searchAccounts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getAccounts({ 
                    search: inputValue,
                    limit: 100,
                    minimal: true
                });
                if (active) {
                    setOptions(response.accounts);
                }
            } catch (error) {
                console.error('Failed to search accounts:', error);
                setError('Failed to search accounts');
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        const debounceTimer = setTimeout(searchAccounts, 300);

        return () => {
            active = false;
            clearTimeout(debounceTimer);
        };
    }, [inputValue]);

    return (
        <Autocomplete
            multiple
            value={selectedAccounts}
            onChange={(_, newValue) => onChange(newValue)}
            inputValue={inputValue}
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            options={options}
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
            filterOptions={(options, { inputValue }) => {
                // Custom filter to match on name
                const filtered = options.filter(option =>
                    option.name.toLowerCase().includes(inputValue.toLowerCase())
                );
                return filtered;
            }}
        />
    );
}
