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
    Link
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { getAccounts, getProperties, getJobTypes } from '../../services/api';
import { Point, Polygon } from 'geojson';
import { PropertyType, PropertyStatus } from '@fieldhive/shared/src/types/property';

interface Account {
    id: string;
    name: string;
}

interface PropertyAccount {
    accountId: string;
    name: string;
    role: string;
}

interface Property {
    id: string;
    name: string;
    address: string;
    location: Point;
    boundary?: Polygon;
    type: PropertyType;
    status: PropertyStatus;
    accounts: PropertyAccount[];
}

interface JobType {
    id: string;
    name: string;
}

interface AddJobDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { property_id: string; job_type_id: string }) => void;
}

const steps = ['Select Account', 'Select Property', 'Select Job Type'];

export default function AddJobDialog({ open, onClose, onSubmit }: AddJobDialogProps) {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [selectedJobType, setSelectedJobType] = useState<string>('');
    const [accountSearchQuery, setAccountSearchQuery] = useState('');
    const [propertySearchQuery, setPropertySearchQuery] = useState('');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [jobTypes, setJobTypes] = useState<JobType[]>([]);

    useEffect(() => {
        const fetchAccounts = async () => {
            const response = await getAccounts();
            setAccounts(response.accounts);
        };

        const fetchJobTypes = async () => {
            try {
                console.log('Fetching job types...');
                const response = await getJobTypes();
                console.log('Job types response:', response);
                setJobTypes(response.jobTypes);
            } catch (error) {
                console.error('Error fetching job types:', error);
            }
        };

        fetchAccounts();
        fetchJobTypes();
    }, []);

    useEffect(() => {
        const fetchProperties = async () => {
            const response = await getProperties(1, 100);
            if (selectedAccount) {
                setProperties(response.properties.filter((p: Property) => 
                    p.accounts.some(account => account.accountId === selectedAccount.id)
                ));
            } else {
                setProperties([]);
            }
        };

        fetchProperties();
    }, [selectedAccount]);

    const handleCreateNewAccount = () => {
        onClose();
        router.push('/accounts?action=create');
    };

    const handleCreateNewProperty = () => {
        if (!selectedAccount) return;
        onClose();
        router.push(`/properties/new?accountId=${selectedAccount.id}`);
    };

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = () => {
        if (!selectedProperty) return;
        onSubmit({
            property_id: selectedProperty.id,
            job_type_id: selectedJobType
        });
        handleClose();
    };

    const handleClose = () => {
        setActiveStep(0);
        setSelectedAccount(null);
        setSelectedProperty(null);
        setSelectedJobType('');
        setAccountSearchQuery('');
        setPropertySearchQuery('');
        onClose();
    };

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
                            onChange={(_, newValue) => setSelectedAccount(newValue)}
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
                console.log('Available job types:', jobTypes);
                return (
                    <TextField
                        select
                        fullWidth
                        label="Job Type"
                        value={selectedJobType}
                        onChange={(e) => setSelectedJobType(e.target.value)}
                        sx={{ mt: 2 }}
                    >
                        {jobTypes.map((type) => (
                            <MenuItem key={type.id} value={type.id}>
                                {type.name}
                            </MenuItem>
                        ))}
                    </TextField>
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
                return !!selectedJobType;
            default:
                return false;
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
