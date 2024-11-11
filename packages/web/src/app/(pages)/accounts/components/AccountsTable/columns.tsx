import { GridColDef } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { getTypeColor, getStatusColor } from '../../utils/colorHelpers';

interface Property {
    property_id: string;
    name: string;
}

interface Account {
    account_id: string;
    name: string;
    type: string;
    status: string;
    properties: Property[];
    created_at: string;
    updated_at: string;
}

export const getColumns = (settings: any): GridColDef<Account>[] => [
    {
        field: 'name',
        headerName: 'Account Name',
        flex: 1,
        minWidth: 200
    },
    {
        field: 'properties',
        headerName: 'Properties',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => {
            const properties = params.row.properties || [];
            return properties.length ? properties.map((p: Property) => p.name).join(', ') : 'No properties';
        }
    },
    {
        field: 'type',
        headerName: 'Type',
        width: 150,
        renderCell: (params) => {
            if (!settings) {
                return <Chip label={params.value} size="small" variant="filled" />;
            }
            const color = getTypeColor(params.value, settings.types);
            return (
                <Chip 
                    label={params.value} 
                    size="small"
                    variant="filled"
                    sx={{ 
                        backgroundColor: color,
                        color: color ? 'white' : 'inherit'
                    }}
                />
            );
        }
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => {
            if (!settings) {
                return <Chip label={params.value} size="small" variant="filled" />;
            }
            const color = getStatusColor(params.value, settings.statuses);
            return (
                <Chip 
                    label={params.value} 
                    size="small"
                    variant="filled"
                    sx={{ 
                        backgroundColor: color,
                        color: color ? 'white' : 'inherit'
                    }}
                />
            );
        }
    }
];
