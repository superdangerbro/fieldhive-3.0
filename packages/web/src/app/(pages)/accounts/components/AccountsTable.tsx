'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Checkbox, 
  FormControlLabel, 
  Stack, 
  Typography, 
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams, GridSelectionModel } from '@mui/x-data-grid';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAccounts, useBulkDeleteAccounts, useAccountSettings } from '../hooks/useAccounts';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import { getTypeColor, getStatusColor } from '../utils/colorHelpers';
import type { Account } from '@/app/globalTypes/account';

interface AccountsTableProps {
  refreshTrigger?: number;
  onAccountSelect: (account: Account | null) => void;
  selectedAccount: Account | null;
  onAccountsLoad: (accounts: Account[]) => void;
}

export function AccountsTable({ 
  refreshTrigger = 0, 
  onAccountSelect,
  selectedAccount,
  onAccountsLoad
}: AccountsTableProps) {
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRows, setSelectedRows] = useState<GridSelectionModel>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { notifySuccess, notifyError } = useActionNotifications();
  const { data: accounts = [], isLoading } = useAccounts({
    limit: pageSize,
    offset: page * pageSize,
    search: filterText
  });

  const { data: settings } = useAccountSettings();
  const bulkDeleteMutation = useBulkDeleteAccounts();

  // Reset selection when accounts change
  useEffect(() => {
    if (selectedAccount) {
      setSelectedRows([selectedAccount.account_id]);
    } else {
      setSelectedRows([]);
    }
  }, [selectedAccount]);

  const defaultColumns: GridColDef[] = [
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
      valueGetter: (params) => {
        const address = params.row.billingAddress;
        if (!address) return 'No address';
        return `${address.address1}${address.address2 ? `, ${address.address2}` : ''}, ${address.city}, ${address.province} ${address.postal_code}`;
      }
    },
    {
      field: 'properties',
      headerName: 'Properties',
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => {
        const properties = params.value || [];
        return properties.length ? properties.map((p: { name: string }) => p.name).join(', ') : 'No properties';
      }
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      renderCell: (params) => {
        if (!settings) {
          return <Chip label={params.value} size="small" />;
        }
        const color = getTypeColor(params.value, settings.types);
        return (
          <Chip 
            label={params.value} 
            size="small" 
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
          return <Chip label={params.value} size="small" />;
        }
        const color = getStatusColor(params.value, settings.statuses);
        return (
          <Chip 
            label={params.value} 
            size="small" 
            sx={{ 
              backgroundColor: color,
              color: color ? 'white' : 'inherit'
            }}
          />
        );
      }
    }
  ];

  useEffect(() => {
    setVisibleColumns(defaultColumns.map(col => col.field));
  }, []);

  useEffect(() => {
    if (accounts) {
      onAccountsLoad(accounts);
    }
  }, [accounts, onAccountsLoad]);

  const handleColumnMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor(event.currentTarget);
  }, []);

  const handleColumnMenuClose = useCallback(() => {
    setColumnMenuAnchor(null);
  }, []);

  const toggleColumn = useCallback((field: string) => {
    setVisibleColumns(prev => {
      if (prev.includes(field)) {
        return prev.filter(f => f !== field);
      } else {
        return [...prev, field];
      }
    });
  }, []);

  const columns = useMemo(() => 
    defaultColumns
      .filter(col => visibleColumns.includes(col.field))
      .map(col => ({
        ...col,
        filterable: true
      }))
  , [visibleColumns]);

  const handleRowClick = useCallback((params: GridRowParams) => {
    const account = accounts.find((a: Account) => a.account_id === params.id);
    if (account && (!selectedAccount || account.account_id !== selectedAccount.account_id)) {
      onAccountSelect(account);
    }
  }, [accounts, onAccountSelect, selectedAccount]);

  const handleSelectionChange = (newSelection: GridSelectionModel) => {
    setSelectedRows(newSelection);
    // If only one row is selected, update the selected account
    if (newSelection.length === 1) {
      const account = accounts.find((a: Account) => a.account_id === newSelection[0]);
      if (account) {
        onAccountSelect(account);
      }
    } else {
      onAccountSelect(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(selectedRows as string[]);
      setSelectedRows([]);
      onAccountSelect(null);
      setDeleteDialogOpen(false);
      notifySuccess(`Successfully deleted ${selectedRows.length} accounts`);
    } catch (error) {
      console.error('Failed to delete accounts:', error);
      notifyError('Failed to delete accounts');
    }
  };

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center"
            justifyContent="flex-end"
          >
            <Box sx={{ flexGrow: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {accounts.length} accounts found
                </Typography>
                {selectedRows.length > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete Selected ({selectedRows.length})
                  </Button>
                )}
              </Stack>
            </Box>
            <TextField
              label="Filter Records"
              variant="outlined"
              size="small"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: <FilterListIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
            <Tooltip title="Select Columns">
              <IconButton 
                onClick={handleColumnMenuOpen}
                sx={{ ml: 1 }}
              >
                <ViewColumnIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={columnMenuAnchor}
              open={Boolean(columnMenuAnchor)}
              onClose={handleColumnMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {defaultColumns.map((column) => (
                <MenuItem key={column.field} onClick={() => toggleColumn(column.field)}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={visibleColumns.includes(column.field)}
                        onChange={() => toggleColumn(column.field)}
                      />
                    }
                    label={column.headerName}
                  />
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        </CardContent>
      </Card>

      <DataGrid
        rows={accounts}
        columns={columns}
        getRowId={(row) => row.account_id}
        rowCount={accounts.length}
        loading={isLoading}
        paginationMode="server"
        page={page}
        pageSize={pageSize}
        rowsPerPageOptions={[25, 50, 100]}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        onRowClick={handleRowClick}
        checkboxSelection
        disableSelectionOnClick
        disableColumnMenu
        selectionModel={selectedRows}
        onSelectionModelChange={handleSelectionChange}
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer'
          }
        }}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Are you sure you want to delete {selectedRows.length} selected accounts? This action cannot be undone.
          </Alert>
          <Typography variant="body2" sx={{ mt: 2 }}>
            All associated data, including billing addresses, will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkDelete}
            variant="contained" 
            color="error"
            disabled={bulkDeleteMutation.isPending}
          >
            {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
