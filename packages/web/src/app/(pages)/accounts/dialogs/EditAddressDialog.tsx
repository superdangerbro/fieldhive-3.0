'use client';

import React from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent
} from '@mui/material';
import { Address, CreateAddressDto } from '@/app/globaltypes';
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
    // Convert Address to CreateAddressDto for the form
    const formInitialAddress = initialAddress ? {
        address1: initialAddress.address1,
        address2: initialAddress.address2,
        city: initialAddress.city,
        province: initialAddress.province,
        postal_code: initialAddress.postal_code,
        country: initialAddress.country,
        label: initialAddress.label
    } : null;

    // Handle form submission by preserving the address_id if it exists
    const handleSubmit = (formData: CreateAddressDto) => {
        onSave({
            ...formData,
            address_id: initialAddress?.address_id || '',
            created_at: initialAddress?.created_at,
            updated_at: initialAddress?.updated_at
        });
    };

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
                    initialAddress={formInitialAddress}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}
