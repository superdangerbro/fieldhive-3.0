'use client';

import React, { useState, useEffect } from 'react';
import {
    TextField,
    Autocomplete,
    Box,
    Typography,
    CircularProgress,
    ListItem,
    ListItemText
} from '@mui/material';
import { Property } from '@fieldhive/shared';
import { getProperties } from '../../../services/api';

interface PropertySearchProps {
    onManageFloorPlans: () => void;
    isFloorPlansOpen: boolean;
    onFloorPlansOpenChange: (open: boolean) => void;
}

export function PropertySearch({ onManageFloorPlans, isFloorPlansOpen, onFloorPlansOpenChange }: PropertySearchProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let active = true;

        if (searchTerm === '') {
            setOptions([]);
            return undefined;
        }

        setLoading(true);

        getProperties({ search: searchTerm })
            .then((response) => {
                if (active) {
                    setOptions(response.properties);
                }
            })
            .catch(error => {
                console.error('Error searching properties:', error);
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [searchTerm]);

    const getOptionLabel = (option: Property) => {
        const address = [
            option.service_address?.address1,
            option.service_address?.address2,
            option.service_address?.city,
            option.service_address?.province
        ].filter(Boolean).join(', ');
        return `${option.name} - ${address}`;
    };

    return (
        <Box sx={{ position: 'absolute', top: 24, left: 24, width: 400, zIndex: 1000 }}>
            <Autocomplete
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={getOptionLabel}
                options={options}
                loading={loading}
                onChange={(event, value) => {
                    if (value) {
                        onFloorPlansOpenChange(true);
                    }
                }}
                onInputChange={(event, value) => {
                    setSearchTerm(value);
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder="Search properties..."
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        }}
                        sx={{
                            backgroundColor: 'background.paper',
                            borderRadius: 1,
                            boxShadow: 2,
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'transparent'
                                },
                                '&:hover fieldset': {
                                    borderColor: 'transparent'
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'transparent'
                                }
                            }
                        }}
                    />
                )}
                renderOption={(props, option) => (
                    <ListItem {...props}>
                        <ListItemText
                            primary={option.name}
                            secondary={[
                                option.service_address?.address1,
                                option.service_address?.address2,
                                option.service_address?.city,
                                option.service_address?.province
                            ].filter(Boolean).join(', ')}
                        />
                    </ListItem>
                )}
            />
        </Box>
    );
}
