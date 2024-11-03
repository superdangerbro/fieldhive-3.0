'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Card, CardContent, TextField, IconButton, Tooltip, Menu, MenuItem, Checkbox, FormControlLabel, Stack, Typography, Chip } from '@mui/material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useAccountStore } from '../store';
import type { Account } from 'app/globaltypes';

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
  const { 
    accounts, 
    isLoading, 
    fetchAccounts, 
    getTypeColor, 
    getStatusColor,
    settingsLoaded 
  } = useAccountStore();
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);

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
        return properties.length ? properties.map((p: any) => p.name).join(', ') : 'No properties';
      }
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      renderCell: (params) => {
        if (!settingsLoaded) {
          return <Chip label={params.value} size="small" />;
        }
        const color = getTypeColor(params.value);
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
        if (!settingsLoaded) {
          return <Chip label={params.value} size="small" />;
        }
        const color = getStatusColor(params.value);
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

  useEffect(() => {
    fetchAccounts().catch(error => {
      console.error('Failed to fetch accounts:', error);
    });
  }, [page, pageSize, refreshTrigger, filterText, fetchAccounts]);

  useEffect(() => {
    if (accounts) {
      setTotalRows(accounts.length);
      onAccountsLoad(accounts);
    }
  }, [accounts, onAccountsLoad]);

  const handleRowClick = useCallback((params: GridRowParams) => {
    const account = accounts.find(a => a.account_id === params.id);
    if (account && account.account_id !== selectedAccount?.account_id) {
      onAccountSelect(account);
    }
  }, [accounts, onAccountSelect, selectedAccount]);

  const selectionModel = useMemo(() => 
    selectedAccount?.account_id ? [selectedAccount.account_id] : []
  , [selectedAccount?.account_id]);

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
              <Typography variant="body2" color="text.secondary">
                {totalRows} accounts found
              </Typography>
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
        rowCount={totalRows}
        loading={isLoading}
        paginationMode="server"
        page={page}
        pageSize={pageSize}
        rowsPerPageOptions={[25, 50, 100]}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        disableSelectionOnClick
        disableColumnMenu
        onRowClick={handleRowClick}
        selectionModel={selectionModel}
        isRowSelectable={() => true}
        keepNonExistentRowsSelected={false}
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer'
          }
        }}
      />
    </Box>
  );
}
