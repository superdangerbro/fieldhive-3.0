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
import { useApi } from '../../../services/api';

interface PropertySearchProps {
    onSelect: (property: Property) => void;
}

export default function PropertySearch({ onSelect }: PropertySearchProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const api = useApi();

    useEffect(() => {
        let active = true;

        if (searchTerm === '') {
            setOptions([]);
            return undefined;
        }

        setLoading(true);

        api.searchProperties({ search: searchTerm })
            .then((response) => {
                if (active) {
                    setOptions(response.properties);
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [searchTerm, api]);

    const getOptionLabel = (option: Property) => {
        const address = [
            option.serviceAddress?.address1,
            option.serviceAddress?.address2,
            option.serviceAddress?.city,
            option.serviceAddress?.province
        ].filter(Boolean).join(', ');
        return `${option.name} - ${address}`;
    };

    return (
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
                    onSelect(value);
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
                />
            )}
            renderOption={(props, option) => (
                <ListItem {...props}>
                    <ListItemText
                        primary={option.name}
                        secondary={[
                            option.serviceAddress?.address1,
                            option.serviceAddress?.address2,
                            option.serviceAddress?.city,
                            option.serviceAddress?.province
                        ].filter(Boolean).join(', ')}
                    />
                </ListItem>
            )}
        />
    );
}
