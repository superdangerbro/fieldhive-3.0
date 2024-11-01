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
    MenuItem,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Autocomplete,
    FormControlLabel,
    Checkbox,
    FormControl,
    InputLabel,
    Select,
    Grid
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { getAccounts, getProperties, getJobTypes } from '../../services/api';
import { Property, Address } from '@fieldhive/shared';
import { Account } from '@fieldhive/shared';
import { CreateJobDto } from '@fieldhive/shared';

interface AddJobDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateJobDto) => void;
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

const steps = ['Select Account', 'Select Property', 'Job Details'];

export default function AddJobDialog({ open, onClose, onSubmit }: AddJobDialogProps) {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedJobType, setSelectedJobType] = useState('');
    const [accountSearchQuery, setAccountSearchQuery] = useState('');
    const [propertySearchQuery, setPropertySearchQuery] = useState('');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [jobTypes, setJobTypes] = useState<{id: string, name: string}[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    // Address handling
    const [useCustomAddresses, setUseCustomAddresses] = useState(false);
    const [serviceAddressId, setServiceAddressId] = useState<string | null>(null);
    const [billingAddressId, setBillingAddressId] = useState<string | null>(null);
    const [customServiceAddress, setCustomServiceAddress] = useState<AddressFormData>(emptyAddressForm);
    const [customBillingAddress, setCustomBillingAddress] = useState<AddressFormData>(emptyAddressForm);
    const [availableAddresses, setAvailableAddresses] = useState<Address[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accountsResponse, jobTypesResponse] = await Promise.all([
                    getAccounts({ limit: 100, offset: 0 }),
                    getJobTypes()
                ]);
                setAccounts(accountsResponse.accounts);
                setJobTypes(jobTypesResponse.jobTypes);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data');
            }
        };

        if (open) {
            fetchData();
        }
    }, [open]);

    useEffect(() => {
        const fetchProperties = async () => {
            if (!selectedAccount) {
                setProperties([]);
                return;
            }

            try {
                const response = await getProperties({ accountId: selectedAccount.account_id });
                setProperties(response.properties);
            } catch (error) {
                console.error('Error fetching properties:', error);
                setError('Failed to fetch properties');
            }
        };

        fetchProperties();
    }, [selectedAccount]);

    useEffect(() => {
        if (selectedAccount) {
            // Collect all addresses from the account and its properties
            const addresses: Address[] = [];
            if (selectedAccount.addresses) {
                addresses.push(...selectedAccount.addresses);
            }
            setAvailableAddresses(addresses);
        }
    }, [selectedAccount]);

    const handleCreateNewAccount = () => {
        onClose();
        router.push('/accounts?action=create');
    };

    const handleCreateNewProperty = () => {
        if (!selectedAccount) return;
        onClose();
        router.push(`/properties/new?accountId=${selectedAccount.account_id}`);
    };

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = () => {
        if (!selectedProperty) return;

        const data: any = {
            title,
            description,
            propertyId: selectedProperty.property_id,
            jobTypeId: selectedJobType,
            status: 'pending',
            use_custom_addresses: useCustomAddresses
        };

        if (useCustomAddresses) {
            data.service_address_id = serviceAddressId;
            data.billing_address_id = billingAddressId;
            
            if (!serviceAddressId && customServiceAddress.address1) {
                data.custom_service_address = customServiceAddress;
            }
            if (!billingAddressId && customBillingAddress.address1) {
                data.custom_billing_address = customBillingAddress;
            }
        }

        onSubmit(data);
        handleClose();
    };

    const handleClose = () => {
        setActiveStep(0);
        setSelectedAccount(null);
        setSelectedProperty(null);
        setTitle('');
        setDescription('');
        setSelectedJobType('');
        setAccountSearchQuery('');
        setPropertySearchQuery('');
        setError(null);
        setUseCustomAddresses(false);
        setServiceAddressId(null);
        setBillingAddressId(null);
        setCustomServiceAddress(emptyAddressForm);
        setCustomBillingAddress(emptyAddressForm);
        onClose();
    };

    const renderAddressForm = (
        type: 'service' | 'billing',
        address: AddressFormData,
        setAddress: (address: AddressFormData) => void
    ) => (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {type === 'service' ? 'Service Address' : 'Billing Address'}
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Address Line 1"
                        value={address.address1}
                        onChange={(e) => setAddress({ ...address, address1: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Address Line 2"
                        value={address.address2}
                        onChange={(e) => setAddress({ ...address, address2: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="City"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Province/State"
                        value={address.province}
                        onChange={(e) => setAddress({ ...address, province: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Postal Code"
                        value={address.postal_code}
                        onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Country"
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    />
                </Grid>
            </Grid>
        </Box>
    );

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Autocomplete
                            fullWidth
                            options={accounts}
                            getOptionLabel={(option) => option.name}
                            value={selectedAccount}
                            onChange={(_, newValue) => {
                                setSelectedAccount(newValue);
                                setSelectedProperty(null);
                            }}
                            inputValue={accountSearchQuery}
                            onInputChange={(_, newValue) => setAccountSearchQuery(newValue)}
                            renderInput={(params) => (
                                <TextField {...params} label="Search Accounts" />
                            )}
                            sx={{ mb: 2 }}
                        />
                        <Button
                            variant="text"
                            onClick={handleCreateNewAccount}
                            sx={{ textTransform: 'none' }}
                        >
                            Create New Account
                        </Button>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <Autocomplete
                            fullWidth
                            options={properties}
                            getOptionLabel={(option) => option.name}
                            value={selectedProperty}
                            onChange={(_, newValue) => setSelectedProperty(newValue)}
                            inputValue={propertySearchQuery}
                            onInputChange={(_, newValue) => setPropertySearchQuery(newValue)}
                            renderInput={(params) => (
                                <TextField {...params} label="Search Properties" />
                            )}
                            sx={{ mb: 2 }}
                        />
                        <Button
                            variant="text"
                            onClick={handleCreateNewProperty}
                            sx={{ textTransform: 'none' }}
                        >
                            Create New Property
                        </Button>
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Job Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Job Type"
                            value={selectedJobType}
                            onChange={(e) => setSelectedJobType(e.target.value)}
                        >
                            {jobTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={4}
                        />
                        
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={useCustomAddresses}
                                    onChange={(e) => {
                                        setUseCustomAddresses(e.target.checked);
                                        if (!e.target.checked) {
                                            setServiceAddressId(null);
                                            setBillingAddressId(null);
                                            setCustomServiceAddress(emptyAddressForm);
                                            setCustomBillingAddress(emptyAddressForm);
                                        }
                                    }}
                                />
                            }
                            label="Use Custom Addresses"
                        />

                        {useCustomAddresses && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                    Select Existing Addresses or Create New Ones
                                </Typography>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Service Address
                                    </Typography>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Select Existing Address</InputLabel>
                                        <Select
                                            value={serviceAddressId || ''}
                                            onChange={(e) => {
                                                setServiceAddressId(e.target.value);
                                                if (e.target.value) {
                                                    setCustomServiceAddress(emptyAddressForm);
                                                }
                                            }}
                                            label="Select Existing Address"
                                        >
                                            <MenuItem value="">
                                                <em>None (Create New)</em>
                                            </MenuItem>
                                            {availableAddresses.map((address) => (
                                                <MenuItem key={address.address_id} value={address.address_id}>
                                                    {`${address.address1}, ${address.city}, ${address.province}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    {!serviceAddressId && renderAddressForm('service', customServiceAddress, setCustomServiceAddress)}
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Billing Address
                                    </Typography>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Select Existing Address</InputLabel>
                                        <Select
                                            value={billingAddressId || ''}
                                            onChange={(e) => {
                                                setBillingAddressId(e.target.value);
                                                if (e.target.value) {
                                                    setCustomBillingAddress(emptyAddressForm);
                                                }
                                            }}
                                            label="Select Existing Address"
                                        >
                                            <MenuItem value="">
                                                <em>None (Create New)</em>
                                            </MenuItem>
                                            {availableAddresses.map((address) => (
                                                <MenuItem key={address.address_id} value={address.address_id}>
                                                    {`${address.address1}, ${address.city}, ${address.province}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    {!billingAddressId && renderAddressForm('billing', customBillingAddress, setCustomBillingAddress)}
                                </Box>
                            </Box>
                        )}
                    </Box>
                );
            default:
                return null;
        }
    };

    const isStepComplete = (step: number) => {
        switch (step) {
            case 0:
                return !!selectedAccount;
            case 1:
                return !!selectedProperty;
            case 2:
                if (!title || !selectedJobType) return false;
                if (useCustomAddresses) {
                    const hasServiceAddress = serviceAddressId || 
                        (customServiceAddress.address1 && customServiceAddress.city && 
                         customServiceAddress.province && customServiceAddress.postal_code && 
                         customServiceAddress.country);
                    const hasBillingAddress = billingAddressId || 
                        (customBillingAddress.address1 && customBillingAddress.city && 
                         customBillingAddress.province && customBillingAddress.postal_code && 
                         customBillingAddress.country);
                    return hasServiceAddress || hasBillingAddress;
                }
                return true;
            default:
                return false;
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Add New Job</DialogTitle>
            <DialogContent>
                <Box sx={{ width: '100%', mt: 2 }}>
                    <Stepper activeStep={activeStep}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <Box sx={{ mt: 4, mb: 2 }}>
                        {getStepContent(activeStep)}
                    </Box>
                    {error && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                {activeStep > 0 && (
                    <Button onClick={handleBack}>Back</Button>
                )}
                {activeStep === steps.length - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!isStepComplete(activeStep)}
                    >
                        Create Job
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        variant="contained"
                        disabled={!isStepComplete(activeStep)}
                    >
                        Next
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
