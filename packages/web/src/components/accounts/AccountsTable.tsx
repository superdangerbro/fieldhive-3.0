'use client';

import React, { useState, useEffect } from 'react';
import { Box, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { dataGridStyles } from '@/styles/dataGrid';
import { getAccounts } from '@/services/api';
import { Account } from '@fieldhive/shared';

interface AccountsTableProps {
    refreshTrigger: number;
}

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
            return address ? `${address.city}, ${address.province}` : '';
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

export default function AccountsTable({ refreshTrigger }: AccountsTableProps) {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRows, setTotalRows] = useState(0);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                const response = await getAccounts(page + 1, pageSize);
                setAccounts(response.accounts);
                setTotalRows(response.total);
            } catch (error) {
                console.error('Failed to fetch accounts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, [page, pageSize, refreshTrigger]);

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={accounts}
                columns={columns}
                getRowId={(row) => row.id}
                rowCount={totalRows}
                loading={loading}
                paginationMode="server"
                page={page}
                pageSize={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                rowsPerPageOptions={[5, 10, 20]}
                disableSelectionOnClick
                sx={dataGridStyles}
            />
        </Box>
    );
}
