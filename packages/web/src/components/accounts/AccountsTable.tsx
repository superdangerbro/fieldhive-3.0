'use client';

import React, { useState, useEffect } from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import { getAccounts } from '../../services/api';
import { Account } from '@fieldhive/shared';
import EditAccountDialog from './EditAccountDialog';

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

const formatAddress = (address: any) => {
    if (!address) return 'No address';
    const parts = [];
    if (address.address1) parts.push(address.address1);
    if (address.city) parts.push(address.city);
    if (address.province) parts.push(address.province);
    return parts.length > 0 ? parts.join(', ') : 'No address';
};

export default function AccountsTable({ refreshTrigger }: AccountsTableProps) {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRows, setTotalRows] = useState(0);
    const [editAccount, setEditAccount] = useState<Account | null>(null);

    const handleEdit = (account: Account) => {
        setEditAccount(account);
    };

    const handleEditSuccess = () => {
        fetchAccounts();
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
            headerName: 'Billing Address',
            flex: 1,
            minWidth: 200,
            valueGetter: (params) => formatAddress(params.value)
        },
        {
            field: 'properties',
            headerName: 'Properties',
            flex: 1,
            minWidth: 200,
            valueGetter: (params) => {
                const properties = params.value || [];
                return properties.length ? properties.map((p: any) => p.name).join(', ') : 'No properties';
            }
        },
        {
            field: 'isCompany',
            headerName: 'Type',
            width: 120,
            valueGetter: (params) => params.value ? 'Company' : 'Individual'
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value || 'Unknown'}
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
            valueGetter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
        },
        {
            field: 'updatedAt',
            headerName: 'Last Updated',
            width: 180,
            valueGetter: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            renderCell: (params) => (
                <Tooltip title="Edit Account">
                    <IconButton
                        onClick={() => handleEdit(params.row)}
                        size="small"
                        sx={{ color: 'primary.main' }}
                    >
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            )
        }
    ];

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

    useEffect(() => {
        fetchAccounts();
    }, [page, pageSize, refreshTrigger]);

    return (
        <Box sx={{ height: 435, width: '100%' }}>
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
            />
            <EditAccountDialog
                open={!!editAccount}
                account={editAccount}
                onClose={() => setEditAccount(null)}
                onSuccess={handleEditSuccess}
            />
        </Box>
    );
}
