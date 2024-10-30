import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, IconButton, Tooltip, Menu, MenuItem, Checkbox, FormControlLabel, Stack, Typography, Chip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getAccounts } from '../../services/api';
import type { Account } from '@fieldhive/shared';

interface AccountsTableProps {
  refreshTrigger?: number;
  onAccountSelect: (account: Account | null) => void;
  selectedAccount: Account | null;
  onAccountsLoad: (accounts: Account[]) => void;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Individual': return 'info';
    case 'Company': return 'secondary';
    case 'Property Manager': return 'primary';
    default: return undefined;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Inactive': return 'warning';
    case 'Archived': return 'error';
    default: return undefined;
  }
};

const defaultColumns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Account Name',
    flex: 1,
    minWidth: 200
  },
  {
    field: 'billing_address',
    headerName: 'Billing Address',
    flex: 1,
    minWidth: 200,
    valueGetter: (params) => {
      const address = params.value;
      if (!address) return 'No address';
      const parts = [];
      if (address.address1) parts.push(address.address1);
      if (address.city) parts.push(address.city);
      if (address.province) parts.push(address.province);
      return parts.length > 0 ? parts.join(', ') : 'No address';
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
    renderCell: (params) => (
      <Chip 
        label={params.value} 
        size="small" 
        color={getTypeColor(params.value)}
        sx={{ color: 'white' }}
      />
    )
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => (
      <Chip 
        label={params.value} 
        size="small" 
        color={getStatusColor(params.value)}
        sx={{ color: 'white' }}
      />
    )
  }
];

export default function AccountsTable({ 
  refreshTrigger = 0, 
  onAccountSelect,
  selectedAccount,
  onAccountsLoad
}: AccountsTableProps) {
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns.map(col => col.field));
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);

  const handleColumnMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
  };

  const toggleColumn = (field: string) => {
    setVisibleColumns(prev => {
      if (prev.includes(field)) {
        return prev.filter(f => f !== field);
      } else {
        return [...prev, field];
      }
    });
  };

  const columns = defaultColumns
    .filter(col => visibleColumns.includes(col.field))
    .map(col => ({
      ...col,
      filterable: true
    }));

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await getAccounts({
        limit: pageSize,
        offset: page * pageSize,
        search: filterText
      });
      
      const accountsData = response.accounts;
      setAccounts(accountsData);
      onAccountsLoad(accountsData);
      setTotalRows(response.total);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [page, pageSize, refreshTrigger, filterText]);

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
        loading={loading}
        paginationMode="server"
        page={page}
        pageSize={pageSize}
        rowsPerPageOptions={[25, 50, 100]}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        disableSelectionOnClick
        disableColumnMenu
        onRowClick={(params) => onAccountSelect(params.row as Account)}
        selectionModel={selectedAccount ? [selectedAccount.account_id] : []}
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer'
          }
        }}
      />
    </Box>
  );
}
