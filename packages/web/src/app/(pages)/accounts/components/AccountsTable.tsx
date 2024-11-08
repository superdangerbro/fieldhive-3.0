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
import { DataGrid, GridColDef, GridRowParams, GridRowSelectionModel } from '@mui/x-data-grid';
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

type GridParams = {
  row: Account;
  value: any;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({ 
  refreshTrigger = 0, 
  onAccountSelect,
  selectedAccount,
  onAccountsLoad
}) => {
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { notifySuccess, notifyError } = useActionNotifications();
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: settings } = useAccountSettings();
  const bulkDeleteMutation = useBulkDeleteAccounts();

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
      valueGetter: (params: GridParams) => {
        try {
          const address = params.value;
          if (!address) return 'No address';
          
          const parts = [];
          if (address.address1) parts.push(address.address1);
          if (address.address2) parts.push(address.address2);
          if (address.city) parts.push(address.city);
          if (address.province) parts.push(address.province);
          if (address.postal_code) parts.push(address.postal_code);
          
          return parts.length > 0 ? parts.join(', ') : 'No address';
        } catch (error) {
          console.error('Error formatting address:', error);
          return 'No address';
        }
      }
    },
    {
      field: 'properties',
      headerName: 'Properties',
      flex: 1,
      minWidth: 200,
      valueGetter: (params: GridParams) => {
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

  // Client-side filtering
  const filteredAccounts = useMemo(() => {
    if (!filterText) return accounts;

    const searchText = filterText.toLowerCase();
    return accounts.filter((account: Account) => 
      account.name.toLowerCase().includes(searchText) ||
      account.type.toLowerCase().includes(searchText) ||
      account.status.toLowerCase().includes(searchText) ||
      account.properties?.some((property: { name: string }) => property.name.toLowerCase().includes(searchText)) ||
      (account.billingAddress && (
        (account.billingAddress.address1 && account.billingAddress.address1.toLowerCase().includes(searchText)) ||
        (account.billingAddress.city && account.billingAddress.city.toLowerCase().includes(searchText)) ||
        (account.billingAddress.province && account.billingAddress.province.toLowerCase().includes(searchText))
      ))
    );
  }, [accounts, filterText]);

  // Handle row click (for details view)
  const handleRowClick = useCallback((params: GridRowParams, event: any) => {
    // Ignore clicks on checkboxes
    if (event.target.type === 'checkbox') return;
    
    const account = accounts.find((a: Account) => a.account_id === params.id);
    if (account && (!selectedAccount || account.account_id !== selectedAccount.account_id)) {
      onAccountSelect(account);
    }
  }, [accounts, onAccountSelect, selectedAccount]);

  // Handle checkbox selection (for bulk actions)
  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    setSelectedRows(newSelection);
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(selectedRows as string[]);
      setSelectedRows([]);
      // Only clear selected account if it was part of the deleted rows
      if (selectedAccount && selectedRows.includes(selectedAccount.account_id)) {
        onAccountSelect(null);
      }
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
                  {filteredAccounts.length} accounts found
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
                <MenuItem 
                  key={column.field} 
                  onClick={() => toggleColumn(column.field)}
                  sx={{ padding: 0 }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={visibleColumns.includes(column.field)}
                        onChange={() => toggleColumn(column.field)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                    label={column.headerName}
                    sx={{ width: '100%', padding: '6px 16px', margin: 0 }}
                  />
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        </CardContent>
      </Card>

      <DataGrid
        rows={filteredAccounts}
        columns={columns}
        getRowId={(row) => row.account_id}
        loading={isLoading}
        paginationMode="client"
        initialState={{
          pagination: {
            paginationModel: {
              pageSize,
              page
            }
          }
        }}
        pageSizeOptions={[25, 50, 100]}
        onPaginationModelChange={(model) => {
          setPage(model.page);
          setPageSize(model.pageSize);
        }}
        onRowClick={handleRowClick}
        checkboxSelection
        disableRowSelectionOnClick
        disableColumnMenu
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={handleSelectionChange}
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer'
          },
          '& .MuiCheckbox-root': {
            color: 'primary.main'
          }
        }}
      />

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
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            type="button"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBulkDelete}
            variant="contained" 
            color="error"
            disabled={isLoading}
            type="button"
          >
            {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
