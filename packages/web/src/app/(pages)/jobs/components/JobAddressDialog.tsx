'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControlLabel,
    Switch,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Divider,
    Dialog as ConfirmDialog,
    DialogContentText
} from '@mui/material';
import { AddressForm } from '../../../globalComponents/AddressForm';
import type { Job } from '../../../globalTypes/job';
import type { CreateAddressDto } from '../../../globalTypes/address';
import { useUpdateJob } from '../hooks/useJobs';

interface JobAddressDialogProps {
    open: boolean;
    onClose: () => void;
    job: Job;
    onUpdate?: () => void;
}

export function JobAddressDialog({ open, onClose, job, onUpdate }: JobAddressDialogProps) {
    // State for form values
    const [useCustomAddresses, setUseCustomAddresses] = useState(job.use_custom_addresses);
    const [serviceAddress, setServiceAddress] = useState<CreateAddressDto>(
        job.serviceAddress || {
            address1: '',
            address2: '',
            city: '',
            province: '',
            postal_code: '',
            country: 'Canada'
        }
    );
    const [billingAddress, setBillingAddress] = useState<CreateAddressDto>(
        job.billingAddress || {
            address1: '',
            address2: '',
            city: '',
            province: '',
            postal_code: '',
            country: 'Canada'
        }
    );
    const [sameAsService, setSameAsService] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Update mutation
    const {
        mutate: updateJob,
        isPending: isUpdating,
        error: updateError,
        reset: resetUpdateError
    } = useUpdateJob();

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setUseCustomAddresses(job.use_custom_addresses);
            setServiceAddress(job.serviceAddress || job.property?.serviceAddress || {
                address1: '',
                address2: '',
                city: '',
                province: '',
                postal_code: '',
                country: 'Canada'
            });
            setBillingAddress(job.billingAddress || job.property?.billingAddress || {
                address1: '',
                address2: '',
                city: '',
                province: '',
                postal_code: '',
                country: 'Canada'
            });
            setSameAsService(false);
            setShowConfirmDialog(false);
        }
    }, [open, job]);

    // Update billing address when "same as service" changes
    useEffect(() => {
        if (sameAsService) {
            setBillingAddress(serviceAddress);
        }
    }, [sameAsService, serviceAddress]);

    const handleCustomAddressToggle = (checked: boolean) => {
        if (!checked && job.use_custom_addresses) {
            // If turning off custom addresses and we currently have custom addresses,
            // show confirmation dialog
            setShowConfirmDialog(true);
        } else {
            setUseCustomAddresses(checked);
        }
    };

    const handleConfirmSwitchToProperty = () => {
        setUseCustomAddresses(false);
        setShowConfirmDialog(false);
        
        // Update job to use property addresses
        updateJob(
            {
                id: job.job_id,
                data: {
                    use_custom_addresses: false,
                    service_address_id: job.property?.service_address_id || undefined,
                    billing_address_id: job.property?.billing_address_id || undefined,
                    delete_custom_addresses: true // Backend will handle deleting old custom addresses
                }
            },
            {
                onSuccess: () => {
                    if (onUpdate) {
                        onUpdate();
                    }
                    onClose();
                }
            }
        );
    };

    const handleSave = () => {
        if (useCustomAddresses) {
            // When using custom addresses, send the full address data to create new addresses
            updateJob(
                {
                    id: job.job_id,
                    data: {
                        use_custom_addresses: true,
                        serviceAddress: serviceAddress,
                        billingAddress: sameAsService ? serviceAddress : billingAddress
                    }
                },
                {
                    onSuccess: () => {
                        if (onUpdate) {
                            onUpdate();
                        }
                        onClose();
                    }
                }
            );
        } else {
            // When using property addresses, just use the property's address IDs
            updateJob(
                {
                    id: job.job_id,
                    data: {
                        use_custom_addresses: false,
                        service_address_id: job.property?.service_address_id || undefined,
                        billing_address_id: job.property?.billing_address_id || undefined
                    }
                },
                {
                    onSuccess: () => {
                        if (onUpdate) {
                            onUpdate();
                        }
                        onClose();
                    }
                }
            );
        }
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Edit Job Addresses</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        {updateError && (
                            <Alert severity="error">
                                {updateError instanceof Error ? updateError.message : 'Failed to update addresses'}
                            </Alert>
                        )}

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={useCustomAddresses}
                                    onChange={(e) => handleCustomAddressToggle(e.target.checked)}
                                    disabled={isUpdating}
                                />
                            }
                            label="Use Custom Addresses"
                        />

                        {!useCustomAddresses ? (
                            <Alert severity="info">
                                Using addresses from property: {job.property?.name}
                            </Alert>
                        ) : (
                            <>
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        Service Address
                                    </Typography>
                                    <AddressForm
                                        initialAddress={serviceAddress}
                                        onChange={setServiceAddress}
                                        disabled={isUpdating}
                                    />
                                </Box>

                                <Divider />

                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        <Typography variant="h6">
                                            Billing Address
                                        </Typography>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={sameAsService}
                                                    onChange={(e) => setSameAsService(e.target.checked)}
                                                    disabled={isUpdating}
                                                    size="small"
                                                />
                                            }
                                            label="Same as Service Address"
                                        />
                                    </Box>
                                    {sameAsService ? (
                                        <Alert severity="info">
                                            Using service address for billing
                                        </Alert>
                                    ) : (
                                        <AddressForm
                                            initialAddress={billingAddress}
                                            onChange={setBillingAddress}
                                            disabled={isUpdating}
                                        />
                                    )}
                                </Box>
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={onClose}
                        disabled={isUpdating}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave}
                        variant="contained"
                        disabled={isUpdating}
                        startIcon={isUpdating ? <CircularProgress size={20} /> : null}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                open={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
            >
                <DialogTitle>Switch to Property Addresses?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Switching to property addresses will delete the current custom addresses. This action cannot be undone. Are you sure you want to continue?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirmDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmSwitchToProperty} color="error">
                        Delete Custom Addresses
                    </Button>
                </DialogActions>
            </ConfirmDialog>
        </>
    );
}
