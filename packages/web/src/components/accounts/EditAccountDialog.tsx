import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import type { Account } from '@fieldhive/shared';
import { updateAccount } from '../../services/api';

interface EditAccountDialogProps {
    open: boolean;
    account: Account | null;
    onClose: () => void;
    onSuccess: () => void;
}

interface FormData {
    name: string;
    address: {
        address1: string;
        address2?: string;
        city: string;
        province: string;
        postal_code: string;
        country: string;
    };
}

export default function EditAccountDialog({ open, account, onClose, onSuccess }: EditAccountDialogProps) {
    const [formData, setFormData] = useState<FormData>({
        name: account?.name || '',
        address: account?.billing_address || {
            address1: '',
            address2: '',
            city: '',
            province: '',
            postal_code: '',
            country: 'Canada',
        },
    });

    React.useEffect(() => {
        if (account) {
            setFormData({
                name: account.name,
                address: account.billing_address || {
                    address1: '',
                    address2: '',
                    city: '',
                    province: '',
                    postal_code: '',
                    country: 'Canada',
                },
            });
        }
    }, [account]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value,
                },
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) return;

        try {
            await updateAccount(account.account_id, {
                name: formData.name,
                address: formData.address,
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update account:', error);
        }
    };

    if (!account) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Edit Account</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Account Name"
                        type="text"
                        fullWidth
                        value={formData.name}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.address1"
                        label="Address Line 1"
                        type="text"
                        fullWidth
                        value={formData.address.address1}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.address2"
                        label="Address Line 2"
                        type="text"
                        fullWidth
                        value={formData.address.address2}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.city"
                        label="City"
                        type="text"
                        fullWidth
                        value={formData.address.city}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.province"
                        label="Province"
                        type="text"
                        fullWidth
                        value={formData.address.province}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.postal_code"
                        label="Postal Code"
                        type="text"
                        fullWidth
                        value={formData.address.postal_code}
                        onChange={handleTextChange}
                    />
                    <TextField
                        margin="dense"
                        name="address.country"
                        label="Country"
                        type="text"
                        fullWidth
                        value={formData.address.country}
                        onChange={handleTextChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" color="primary">Save Changes</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
