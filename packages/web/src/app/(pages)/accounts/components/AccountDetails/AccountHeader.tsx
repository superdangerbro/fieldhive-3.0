'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useCrudDialogs } from '@/app/globalHooks/useCrudDialogs';
import { AccountNameSection } from './AccountNameSection';
import { AccountBillingAddress } from './AccountBillingAddress';
import { AccountContacts } from './AccountContacts';
import { AccountStatusType } from './AccountStatusType';
import type { Account } from '@/app/globalTypes/account';

interface AccountHeaderProps {
    account: Account;
    onUpdate: () => void;
}

export function AccountHeader({ account, onUpdate }: AccountHeaderProps) {
    const { openDeleteDialog } = useCrudDialogs();

    const handleDeleteClick = () => {
        openDeleteDialog(account);
    };

    return (
        <Box sx={{ mb: 4 }}>
            <AccountNameSection 
                account={account} 
                onUpdate={onUpdate}
                onDeleteClick={handleDeleteClick}
            />

            <Box sx={{ display: 'flex', gap: 3 }}>
                <AccountBillingAddress 
                    account={account}
                    onUpdate={onUpdate}
                />
                <AccountContacts 
                    account={account}
                    onUpdate={onUpdate}
                />
                <AccountStatusType 
                    account={account}
                    onUpdate={onUpdate}
                />
            </Box>
        </Box>
    );
}
