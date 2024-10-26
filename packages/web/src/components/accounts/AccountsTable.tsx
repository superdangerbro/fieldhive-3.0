'use client';

import React, { useState } from 'react';
import { Box, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { mockAccounts, Account } from '../../services/mockData';
import { dataGridStyles } from '../../styles/dataGrid';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return 'success';
        case 'inactive':
            return 'warning';
        case 'suspended':
            return 'error';
        default:
            return 'default';
    }
};

const columns: GridColDef[] = [
    {
        field: 'name',
        headerName: 'Account Name',
        flex: 1,
        minWidth: 200
    },
    {
        field: 'billingAddress',
        headerName: 'Location',
        flex: 1,
        minWidth: 200,
        valueGetter: (params) => {
            const address = params.value;
            return `${address.city}, ${address.state}`;
        }
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => (
            <Chip
                label={params.value}
                color={getStatusColor(params.value) as any}
                size="small"
                sx={{ textTransform: 'capitalize' }}
            />
        )
    },
    {
        field: 'createdAt',
        headerName: 'Created',
        width: 180,
        valueGetter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
        field: 'updatedAt',
        headerName: 'Last Updated',
        width: 180,
        valueGetter: (params) => new Date(params.value).toLocaleDateString()
    }
];

export default function AccountsTable() {
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 5,
        page: 0
    });
    const [accounts] = useState<Account[]>(mockAccounts);

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={accounts}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 20]}
                disableRowSelectionOnClick
                sx={dataGridStyles}
            />
        </Box>
    );
}
