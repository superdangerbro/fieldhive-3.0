'use client';

import React, { useState, useEffect } from 'react';
import { 
    Autocomplete, 
    TextField, 
    Chip,
    Box,
    CircularProgress
} from '@mui/material';
import { getAccounts } from '../../services/api';

interface MinimalAccount {
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

    useEffect(() => {
        let active = true;

        if (inputValue === '') {
            setOptions(selectedAccounts);
            return;
        }

        const searchAccounts = async () => {
            setLoading(true);
            try {
                const response = await getAccounts({ search: inputValue });
                if (active) {
                    setOptions(response.accounts.map(account => ({
                        account_id: account.account_id,
                        name: account.name
                    })));
                }
            } catch (error) {
                console.error('Failed to fetch accounts:', error);
            } finally {
                setLoading(false);
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
        />
    );
}

export type { MinimalAccount };
