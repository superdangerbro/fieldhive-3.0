'use client';

import React from 'react';
import { 
    GridColDef, 
    GridRenderCellParams
} from '@mui/x-data-grid';
import { StatusChip, formatStatus } from './PropertyStatus';
import type { Property } from '../../../globalTypes/property';
import type { Account } from '../../../globalTypes/account';

function isValidAccount(account: unknown): account is Account {
    if (!account || typeof account !== 'object') return false;
    const acc = account as any;
    return typeof acc.account_id === 'string' && 
           typeof acc.name === 'string';
}

export const defaultColumns: GridColDef<Property>[] = [
    {
        field: 'name',
        headerName: 'Property Name',
        flex: 1,
        minWidth: 200
    },
    {
        field: 'type',
        headerName: 'Type',
        width: 150,
        renderCell: (params: GridRenderCellParams<Property>) => {
            const value = params.row.type;
            if (!value) return '';
            return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
    },
    {
        field: 'accounts',
        headerName: 'Parent Accounts',
        width: 250,
        renderCell: (params: GridRenderCellParams<Property>) => {
            const accounts = params.row.accounts;
            if (!accounts?.length) return 'No Accounts';
            return accounts
                .filter(isValidAccount)
                .map(account => account.name)
                .join(', ');
        }
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params: GridRenderCellParams<Property>) => {
            const status = params.row.status;
            if (!status) return null;
            return <StatusChip status={formatStatus(status)} />;
        }
    },
    {
        field: 'created_at',
        headerName: 'Created',
        width: 150,
        renderCell: (params: GridRenderCellParams<Property>) => {
            const value = params.row.created_at;
            if (!value) return '';
            try {
                const date = new Date(value);
                return date.toLocaleDateString();
            } catch {
                return '';
            }
        }
    },
    {
        field: 'updated_at',
        headerName: 'Updated',
        width: 150,
        renderCell: (params: GridRenderCellParams<Property>) => {
            const value = params.row.updated_at;
            if (!value) return '';
            try {
                const date = new Date(value);
                return date.toLocaleDateString();
            } catch {
                return '';
            }
        }
    }
];

export function filterProperties(properties: Property[], filterText: string): Property[] {
    if (!filterText) return properties;

    const searchText = filterText.toLowerCase();
    return properties.filter((property: Property) => 
        property.name.toLowerCase().includes(searchText) ||
        (property.type && property.type.toLowerCase().includes(searchText)) ||
        property.accounts?.some(account => 
            isValidAccount(account) && account.name.toLowerCase().includes(searchText)
        ) ||
        property.status.toLowerCase().includes(searchText)
    );
}
