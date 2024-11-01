'use client';

import React, { useState, useEffect } from 'react';
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
import type { Job, JobStatus, Address, Property, UpdateJobDto } from '@fieldhive/shared';
import { updateJob, getProperties, getPropertyAddresses, getJobTypes } from '../../services/api';
import JobBasicInfo from './JobBasicInfo';
import JobPropertySelect from './JobPropertySelect';
import JobAddressForms from './JobAddressForms';

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
    country: ''
};

export default function EditJobDialog({ open, job, onClose, onSuccess }: EditJobDialogProps) {
    // Basic Info State
    const [title, setTitle] = useState(job.title);
    const [status, setStatus] = useState<JobStatus>(job.status);
    const [description, setDescription] = useState(job.description || '');
    const [jobTypes, setJobTypes] = useState<Array<{ job_type_id: string; name: string }>>([]);
    const [selectedJobType, setSelectedJobType] = useState<string | null>(null);
    const [loadingJobTypes, setLoadingJobTypes] = useState(false);

    // Property State
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(job.property);
    const [properties, setProperties] = useState<Property[]>([]);

    // Address State
    const [useCustomAddresses, setUseCustomAddresses] = useState(job.use_custom_addresses);
    const [serviceAddressForm, setServiceAddressForm] = useState<AddressFormData>(() => {
        if (job.service_address) {
            return {
                address1: job.service_address.address1 || '',
                address2: job.service_address.address2,
                city: job.service_address.city || '',
                province: job.service_address.province || '',
                postal_code: job.service_address.postal_code || '',
                country: job.service_address.country || ''
            };
        }
        return emptyAddressForm;
    });
    const [billingAddressForm, setBillingAddressForm] = useState<AddressFormData>(() => {
        if (job.billing_address) {
            return {
                address1: job.billing_address.address1 || '',
                address2: job.billing_address.address2,
                city: job.billing_address.city || '',
                province: job.billing_address.province || '',
                postal_code: job.billing_address.postal_code || '',
                country: job.billing_address.country || ''
            };
        }
        return emptyAddressForm;
    });
    const [availableAddresses, setAvailableAddresses] = useState<Address[]>([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobTypes = async () => {
            if (!open) return;
            
            try {
                setLoadingJobTypes(true);
                const response = await getJobTypes();
                if (response.jobTypes) {
                    // Map the API response to match our expected format
                    const mappedTypes = response.jobTypes.map(type => ({
                        job_type_id: type.id,
                        name: type.name
                    }));
                    setJobTypes(mappedTypes);
                    // Set the selected job type only if it exists in the available types
                    const jobTypeExists = mappedTypes.some(type => type.job_type_id === job.job_type?.job_type_id);
                    setSelectedJobType(jobTypeExists ? job.job_type?.job_type_id : null);
                }
            } catch (error) {
                console.error('Error fetching job types:', error);
                setError('Failed to fetch job types');
            } finally {
                setLoadingJobTypes(false);
            }
        };

        fetchJobTypes();
    }, [open, job.job_type?.job_type_id]);

    useEffect(() => {
        const fetchProperties = async () => {
            if (!job.accounts?.length) return;
            
            try {
                const accountIds = job.accounts.map(acc => acc.account_id);
                const propertiesPromises = accountIds.map(accountId => 
                    getProperties({ accountId })
                );
                
                const responses = await Promise.all(propertiesPromises);
                const allProperties = responses.flatMap(response => response.properties);
                setProperties(allProperties);
            } catch (error) {
                console.error('Error fetching properties:', error);
                setError('Failed to fetch properties');
            }
        };

        fetchProperties();
    }, [job.accounts]);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!selectedProperty) return;

            try {
                const propertyAddresses = await getPropertyAddresses(selectedProperty.property_id);
                const addresses: Address[] = [];
                
                if (propertyAddresses.service_address) {
                    addresses.push(propertyAddresses.service_address);
                }
                if (propertyAddresses.billing_address) {
                    addresses.push(propertyAddresses.billing_address);
                }

                if (job.accounts) {
                    job.accounts.forEach(account => {
                        if (account.addresses) {
                            addresses.push(...account.addresses);
                        }
                    });
                }

                setAvailableAddresses(addresses);
            } catch (error) {
                console.error('Error fetching addresses:', error);
                setError('Failed to fetch addresses');
            }
        };

        fetchAddresses();
    }, [selectedProperty, job.accounts]);

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
            country: address.country
        };

        if (type === 'service') {
            setServiceAddressForm(addressForm);
        } else {
            setBillingAddressForm(addressForm);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            const data: UpdateJobDto = {
                title,
                status,
                description,
                use_custom_addresses: useCustomAddresses,
                job_type_id: selectedJobType || undefined
            };

            if (useCustomAddresses) {
                data.custom_service_address = serviceAddressForm;
                data.custom_billing_address = billingAddressForm;
            }

            await updateJob(job.job_id, data);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update job:', error);
            setError('Failed to update job. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    <JobBasicInfo
                        title={title}
                        status={status}
                        jobTypeId={selectedJobType}
                        jobTypes={jobTypes}
                        loadingJobTypes={loadingJobTypes}
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
                        availableAddresses={availableAddresses}
                        onChooseAddress={handleChooseAddress}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}
