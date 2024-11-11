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
  Button
} from '@mui/material';
import { DataGrid, GridColDef, GridRowParams, GridRowSelectionModel } from '@mui/x-data-grid';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAccounts, useBulkDeleteAccounts, useAccountSettings } from '../../hooks';
import { useActionNotifications } from '@/app/globalHooks/useActionNotifications';
import { getColumns } from './columns';
import { DeleteDialog } from './DeleteDialog';

interface Account {
  account_id: string;
  name: string;
  type: string;
  status: string;
  billingAddress: {
    address_id: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  } | null;
  properties: Array<{
    property_id: string;
    name: string;
  }>;
  users: any[];
  created_at: string;
  updated_at: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

interface AccountsTableProps {
  refreshTrigger?: number;
  onAccountSelect: (account: Account | null) => void;
  selectedAccount: Account | null;
  onAccountsLoad: (accounts: Account[]) => void;
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

  // Debug logging
  useEffect(() => {
    if (accounts.length > 0) {
      console.log('Accounts data:', accounts);
      console.log('First account:', accounts[0]);
      if (accounts[0].billingAddress) {
        console.log('First account billing address:', accounts[0].billingAddress);
      }
      if (accounts[0].properties) {
        console.log('First account properties:', accounts[0].properties);
      }
    }
  }, [accounts]);

  useEffect(() => {
    setVisibleColumns(['name', 'billingAddress', 'properties', 'type', 'status']);
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

  const columns = useMemo(() => {
    const cols = getColumns(settings);
    console.log('Generated columns:', cols);
    return cols.filter(col => visibleColumns.includes(col.field));
  }, [visibleColumns, settings]);

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
              {columns.map((column) => (
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

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleBulkDelete}
        selectedCount={selectedRows.length}
        isLoading={bulkDeleteMutation.isPending}
      />
    </Box>
  );
};
