'use client';

import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent
} from '@mui/material';
import { Address } from '@/app/globaltypes';
import { AddressForm } from '@/app/globalComponents/AddressForm';

interface EditAddressDialogProps {
    open: boolean;
    title?: string;
    initialAddress?: Address | null;
    onClose: () => void;
    onSave: (address: Address) => void;
}

export function EditAddressDialog({ 
    open, 
    title = 'Edit Address',
    initialAddress,
    onClose, 
    onSave 
}: EditAddressDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <AddressForm
                    initialAddress={initialAddress}
                    onSubmit={onSave}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}
