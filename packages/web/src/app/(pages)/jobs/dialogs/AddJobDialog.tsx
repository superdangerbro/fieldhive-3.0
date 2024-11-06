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
    Alert,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAccounts } from '@/app/(pages)/accounts/hooks/useAccounts';
import { useProperties } from '@/app/(pages)/properties/hooks/useProperties';
import { useSetting } from '../hooks/useSettings';
import type { Property, CreateAddressDto, Account, CreateJobDto, JobStatus } from '@/app/globalTypes';
import { JobBasicInfo } from '../components/JobBasicInfo';
import { JobPropertySelect } from '../components/JobPropertySelect';
import { JobAddressForms } from '../components/JobAddressForms';

interface AddJobDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateJobDto) => void;
}

const steps = ['Select Account', 'Select Property', 'Job Details'];

const emptyAddressForm: CreateAddressDto = {
    address1: '',
    address2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Canada'
};

export function AddJobDialog({ open, onClose, onSubmit }: AddJobDialogProps) {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Basic Info State
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState<JobStatus>({ name: 'New', color: '#94a3b8' });
    const [description, setDescription] = useState('');
    const [selectedJobType, setSelectedJobType] = useState<string | null>(null);

    // Property State
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    // Address State
    const [useCustomAddresses, setUseCustomAddresses] = useState(false);
    const [serviceAddressForm, setServiceAddressForm] = useState<CreateAddressDto>(emptyAddressForm);
    const [billingAddressForm, setBillingAddressForm] = useState<CreateAddressDto>(emptyAddressForm);

    // Data Fetching
    const { data: accounts = [] } = useAccounts();
    const { data: properties = [] } = useProperties();
    const { data: jobTypes = [], isLoading: loadingJobTypes } = useSetting('job_types');

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleClose = () => {
        setActiveStep(0);
        setTitle('');
        setStatus({ name: 'New', color: '#94a3b8' });
        setDescription('');
        setSelectedJobType(null);
        setSelectedAccount(null);
        setSelectedProperty(null);
        setUseCustomAddresses(false);
        setServiceAddressForm(emptyAddressForm);
        setBillingAddressForm(emptyAddressForm);
        setError(null);
        onClose();
    };

    const handleSubmit = () => {
        if (!selectedProperty || !selectedJobType) return;

        const data: CreateJobDto = {
            name: title,
            type: selectedJobType,
            status: status.name,
            property_id: selectedProperty.property_id,
            description,
            use_custom_addresses: useCustomAddresses,
            service_address: useCustomAddresses ? serviceAddressForm : undefined,
            billing_address: useCustomAddresses ? billingAddressForm : undefined
        };

        onSubmit(data);
        handleClose();
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <JobBasicInfo
                        title={title}
                        status={status}
                        jobTypeId={selectedJobType}
                        onTitleChange={setTitle}
                        onStatusChange={setStatus}
                        onJobTypeChange={setSelectedJobType}
                    />
                );
            case 1:
                return (
                    <JobPropertySelect
                        selectedProperty={selectedProperty}
                        properties={properties}
                        onChange={setSelectedProperty}
                    />
                );
            case 2:
                return (
                    <JobAddressForms
                        useCustomAddresses={useCustomAddresses}
                        onUseCustomAddressesChange={setUseCustomAddresses}
                        selectedProperty={selectedProperty}
                        serviceAddressForm={serviceAddressForm}
                        billingAddressForm={billingAddressForm}
                        onServiceAddressChange={setServiceAddressForm}
                        onBillingAddressChange={setBillingAddressForm}
                        availableAddresses={[]} // TODO: Get available addresses from property/account
                        onChooseAddress={(type, address) => {
                            const addressForm: CreateAddressDto = {
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
                        }}
                    />
                );
            default:
                return null;
        }
    };

    const isStepValid = () => {
        switch (activeStep) {
            case 0:
                return title && selectedJobType;
            case 1:
                return selectedProperty;
            case 2:
                return !useCustomAddresses || (
                    serviceAddressForm.address1 && 
                    serviceAddressForm.city && 
                    serviceAddressForm.province && 
                    serviceAddressForm.postal_code
                );
            default:
                return false;
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Add New Job</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                <Stepper activeStep={activeStep} sx={{ my: 3 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box sx={{ minHeight: 400 }}>
                    {getStepContent(activeStep)}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={handleBack}
                    disabled={activeStep === 0}
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                    disabled={!isStepValid()}
                >
                    {activeStep === steps.length - 1 ? 'Create Job' : 'Next'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
