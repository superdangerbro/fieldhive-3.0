'use client';

import React from 'react';
import { Grid, TextField, Divider } from '@mui/material';
import AccountSelector from '../../components/AccountSelector';
import type { Account } from '@/app/globalTypes/account';

interface PropertyFormProps {
    name: string;
    accounts: Account[];
    loading: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAccountsChange: (accounts: Account[]) => void;
}

export default function PropertyForm({
    name,
    accounts,
    loading,
    onChange,
    onAccountsChange
}: PropertyFormProps) {
    return (
        <>
            <Grid item xs={12}>
                <TextField
                    name="name"
                    label="Property Name"
                    fullWidth
                    required
                    value={name}
                    onChange={onChange}
                    disabled={loading}
                />
            </Grid>
            <Divider sx={{ my: 2 }} />

            <Grid item xs={12}>
                <AccountSelector
                    selectedAccounts={accounts}
                    onChange={onAccountsChange}
                    disabled={loading}
                />
            </Grid>
            <Divider sx={{ my: 2 }} />
        </>
    );
}
