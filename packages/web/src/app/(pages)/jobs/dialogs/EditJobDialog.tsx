'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    TextField,
    Alert
} from '@mui/material';
import type { Job, Address, Property, JobStatus } from '../../../globalTypes';
import { useUpdateJob } from '../hooks/useJobs';
import { useProperties } from '../../properties/hooks/useProperties';
import { JobBasicInfo } from '../components/JobBasicInfo';
import { JobPropertySelect } from '../components/JobPropertySelect';
import { JobAddressForms } from '../components/JobAddressForms';

interface EditJobDialogProps {
    open: boolean;
    job: Job;
    onClose: () => void;
    onSuccess: () => void;
}

interface AddressFormData {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
}

const emptyAddressForm: AddressFormData = {
    address1: '',
    address2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Canada'
};

export function EditJobDialog({ open, job, onClose, onSuccess }: EditJobDialogProps) {
    // Basic Info State
    const [title, setTitle] = useState(job.name);
    const [status, setStatus] = useState<JobStatus>(
        typeof job.status === 'string'
            ? { name: job.status, color: '#94a3b8' }
            : job.status
    );
    const [description, setDescription] = useState('');
    const [selectedJobType, setSelectedJobType] = useState<string | null>(job.jobType?.jobTypeId || null);

    // Property State
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(job.property || null);

    // Address State
    const [useCustomAddresses, setUseCustomAddresses] = useState(job.useCustomAddresses || false);
    const [serviceAddressForm, setServiceAddressForm] = useState<AddressFormData>(() => {
        if (job.serviceAddress) {
            return {
                address1: job.serviceAddress.address1 || '',
                address2: job.serviceAddress.address2,
                city: job.serviceAddress.city || '',
                province: job.serviceAddress.province || '',
                postal_code: job.serviceAddress.postal_code || '',
                country: job.serviceAddress.country || ''
            };
        }
        return emptyAddressForm;
    });
    const [billingAddressForm, setBillingAddressForm] = useState<AddressFormData>(() => {
        if (job.billingAddress) {
            return {
                address1: job.billingAddress.address1 || '',
                address2: job.billingAddress.address2,
                city: job.billingAddress.city || '',
                province: job.billingAddress.province || '',
                postal_code: job.billingAddress.postal_code || '',
                country: job.billingAddress.country || ''
            };
        }
        return emptyAddressForm;
    });

    // Queries and Mutations
    const { data: properties = [] } = useProperties();
    const updateJobMutation = useUpdateJob();

    const handleUseCustomAddressesChange = (useCustom: boolean) => {
        setUseCustomAddresses(useCustom);
        if (!useCustom) {
            setServiceAddressForm(emptyAddressForm);
            setBillingAddressForm(emptyAddressForm);
        }
    };

    const handleChooseAddress = (type: 'service' | 'billing', address: Address) => {
        const addressForm: AddressFormData = {
            address1: address.address1,
            address2: address.address2,
            city: address.city,
            province: address.province,
            postal_code: address.postal_code,
            country: address.country || 'Canada'
        };

        if (type === 'service') {
            setServiceAddressForm(addressForm);
        } else {
            setBillingAddressForm(addressForm);
        }
    };

    const handleSubmit = async () => {
        const data = {
            name: title,
            status: status.name,
            description,
            use_custom_addresses: useCustomAddresses,
            type: selectedJobType || undefined,
            property_id: selectedProperty?.property_id,
            ...(useCustomAddresses && {
                service_address: {
                    ...serviceAddressForm,
                    address_id: job.serviceAddress?.address_id
                },
                billing_address: {
                    ...billingAddressForm,
                    address_id: job.billingAddress?.address_id
                }
            })
        };

        try {
            await updateJobMutation.mutateAsync({ id: job.jobId, data });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update job:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    {updateJobMutation.isError && (
                        <Alert severity="error">
                            Failed to update job. Please try again.
                        </Alert>
                    )}

                    <JobBasicInfo
                        title={title}
                        status={status}
                        jobTypeId={selectedJobType}
                        onTitleChange={setTitle}
                        onStatusChange={setStatus}
                        onJobTypeChange={setSelectedJobType}
                    />

                    <JobPropertySelect
                        selectedProperty={selectedProperty}
                        properties={properties}
                        onChange={setSelectedProperty}
                    />

                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                    />

                    <JobAddressForms
                        useCustomAddresses={useCustomAddresses}
                        onUseCustomAddressesChange={handleUseCustomAddressesChange}
                        selectedProperty={selectedProperty}
                        serviceAddressForm={serviceAddressForm}
                        billingAddressForm={billingAddressForm}
                        onServiceAddressChange={setServiceAddressForm}
                        onBillingAddressChange={setBillingAddressForm}
                        availableAddresses={[]} // Available addresses will come from property/account data
                        onChooseAddress={handleChooseAddress}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={updateJobMutation.isPending}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}
