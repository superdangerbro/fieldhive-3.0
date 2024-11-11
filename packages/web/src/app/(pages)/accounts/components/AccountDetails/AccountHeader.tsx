'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useCrudDialogs } from '../../../../globalHooks/useCrudDialogs';
import { AccountNameSection } from './AccountNameSection';
import { AccountBillingAddress } from './AccountBillingAddress';
import { AccountStatusType } from './AccountStatusType';
import type { Account } from '../../../../globalTypes/account';

interface AccountHeaderProps {
    account: Account;
    onUpdate: () => void;
    onDeleteClick: () => void;
}

export function AccountHeader({ account, onUpdate, onDeleteClick }: AccountHeaderProps) {
    const { openDeleteDialog } = useCrudDialogs();

    const handleUpdate = () => {
        // Force a refetch when any child component updates
        onUpdate();
    };

    return (
        <Box sx={{ mb: 4 }}>
            <AccountNameSection 
                account={account} 
                onUpdate={handleUpdate}
                onDeleteClick={onDeleteClick}
            />

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <AccountBillingAddress 
                        account={account}
                        onUpdate={handleUpdate}
                    />
                </Box>
                <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                    <AccountStatusType 
                        account={account}
                        onUpdate={handleUpdate}
                    />
                </Box>
            </Box>
        </Box>
    );
}
