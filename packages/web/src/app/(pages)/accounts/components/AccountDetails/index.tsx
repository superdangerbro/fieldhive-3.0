'use client';

import React, { useState } from 'react';
import { Address, Account } from '@/app/globaltypes';
import { AddressForm } from '@/app/globalComponents/AddressForm';
import { AccountSummary } from './AccountSummary';
import { EditAddressDialog } from '../../dialogs/EditAddressDialog';
import { Box, Typography } from '@mui/material';

interface AccountDetailsProps {
    account: Account | null;
    onUpdate: () => void;
    onAccountSelect: (account: Account | null) => void;
}

export function AccountDetails({ account, onUpdate, onAccountSelect }: AccountDetailsProps) {
    const [isEditingAddress, setIsEditingAddress] = useState(false);

    const handleEditAddress = () => {
        setIsEditingAddress(true);
    };

    const handleAddressUpdated = (address: Address) => {
        onUpdate();
        setIsEditingAddress(false);
    };

    if (!account) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    Select an account to view details
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <AccountSummary 
                account={{
                    account_id: account.account_id,
                    name: account.name,
                    type: account.type,
                    billingAddress: account.billingAddress || null
                }}
                onEditAddress={handleEditAddress}
            />

            <EditAddressDialog
                open={isEditingAddress}
                initialAddress={account.billingAddress || null}
                onClose={() => setIsEditingAddress(false)}
                onSave={handleAddressUpdated}
            />
        </>
    );
}
