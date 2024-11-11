'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Chip,
    Skeleton,
    Stack
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import type { Property } from '../../../globalTypes/property';
import type { Account } from '../../../globalTypes/account';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import { useUpdateProperty } from '../hooks/usePropertyUpdate';
import { EditParentAccountsDialog } from '../dialogs/EditParentAccountsDialog';

interface PropertyParentAccountsProps {
    property: Property;
    onUpdate: () => void;
}

export default function PropertyParentAccounts({ property, onUpdate }: PropertyParentAccountsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAccounts, setSelectedAccounts] = useState<Account[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
    const updatePropertyMutation = useUpdateProperty();

    useEffect(() => {
        if (property.accounts) {
            setSelectedAccounts([...property.accounts]);
        }
    }, [property.accounts]);

    const handleClose = () => {
        setIsEditing(false);
        setError(null);
        if (property.accounts) {
            setSelectedAccounts([...property.accounts]);
        }
    };

    const handleSubmit = async () => {
        if (!property.property_id) return;
        
        try {
            setError(null);
            await updatePropertyMutation.mutateAsync({
                id: property.property_id,
                data: {
                    account_ids: selectedAccounts.map(acc => acc.account_id)
                }
            });
            onUpdate();
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update parent accounts. Please try again.');
            console.error('Failed to update property accounts:', err);
        }
    };

    const isLoading = loadingAccounts || updatePropertyMutation.isPending;

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                    Parent Accounts
                </Typography>
                <IconButton 
                    size="small" 
                    onClick={() => setIsEditing(true)}
                    sx={{ ml: 'auto' }}
                    disabled={isLoading}
                >
                    <EditIcon fontSize="small" />
                </IconButton>
            </Box>

            {isLoading ? (
                <Stack spacing={1}>
                    <Skeleton variant="rounded" height={32} width={120} />
                    <Skeleton variant="rounded" height={32} width={150} />
                </Stack>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {property.accounts?.map((account) => (
                        <Chip
                            key={account.account_id}
                            label={account.name}
                            size="small"
                            sx={{ bgcolor: 'background.default' }}
                        />
                    ))}
                    {(!property.accounts || property.accounts.length === 0) && (
                        <Typography variant="body2" color="text.secondary">
                            No parent accounts assigned
                        </Typography>
                    )}
                </Box>
            )}

            <EditParentAccountsDialog
                open={isEditing}
                onClose={handleClose}
                onSubmit={handleSubmit}
                selectedAccounts={selectedAccounts}
                onAccountsChange={setSelectedAccounts}
                availableAccounts={accounts}
                isLoading={isLoading}
                error={error}
            />
        </>
    );
}
