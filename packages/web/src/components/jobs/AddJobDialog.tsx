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
    MenuItem,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Autocomplete,
    Link
} from '@mui/material';
import { useRouter } from 'next/navigation';

interface Account {
    id: string;
    name: string;
}

interface Property {
    id: string;
    name: string;
    account: {
        id: string;
        name: string;
    };
}

interface JobType {
    job_type_id: string;
    job_name: string;
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

    // TODO: Replace with actual data fetching
    const accounts: Account[] = [];
    const properties: Property[] = [];
    const jobTypes: JobType[] = [];

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
                            options={properties.filter(p => p.account.id === selectedAccount?.id)}
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
                    <TextField
                        select
                        fullWidth
                        label="Job Type"
                        value={selectedJobType}
                        onChange={(e) => setSelectedJobType(e.target.value)}
                        sx={{ mt: 2 }}
                    >
                        {jobTypes.map((type) => (
                            <MenuItem key={type.job_type_id} value={type.job_type_id}>
                                {type.job_name}
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
