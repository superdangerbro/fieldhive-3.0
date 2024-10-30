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
    Autocomplete
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { getAccounts, getProperties } from '../../services/api';
import { Property } from '@fieldhive/shared';
import { Account } from '@fieldhive/shared';
import { CreateJobDto } from '@fieldhive/shared';

interface AddJobDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateJobDto) => void;
}

const steps = ['Select Account', 'Select Property', 'Job Details'];

// Hardcoded job types until we implement settings management
const JOB_TYPES = [
    'Inspection',
    'Maintenance',
    'Repair',
    'Installation',
    'Emergency'
];

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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await getAccounts();
                setAccounts(response.accounts);
            } catch (error) {
                console.error('Error fetching accounts:', error);
                setError('Failed to fetch accounts');
            }
        };

        fetchAccounts();
    }, []);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const response = await getProperties();
                if (selectedAccount) {
                    // Filter properties that belong to the selected account
                    setProperties(response.properties.filter((p: Property) => 
                        selectedAccount.properties?.some(prop => prop.id === p.id)
                    ));
                } else {
                    setProperties([]);
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
                setError('Failed to fetch properties');
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
        onSubmit({
            title,
            description,
            propertyId: selectedProperty.id,
            jobTypeId: selectedJobType,
            status: 'pending'
        });
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
                            {JOB_TYPES.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
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
                return !!title && !!selectedJobType;
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
