'use client';

import React, { useCallback } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Checkbox, 
  FormControlLabel, 
  Stack, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DataGrid, GridRowParams, GridSelectionModel } from '@mui/x-data-grid';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQueryClient } from '@tanstack/react-query';
import { useProperties, prefetchProperty } from '../hooks/usePropertyList';
import { useDeleteProperty, useBulkDeleteProperties } from '../hooks/usePropertyDelete';
import { useSelectedProperty } from '../hooks/useSelectedProperty';
import { StatusChip, formatStatus } from './PropertyStatus';
import type { Property } from '@/app/globalTypes/property';
import { useState } from 'react';

interface PropertiesTableProps {
  onPropertySelect: (property: Property | null) => void;
  onAddClick: () => void;
}

export default function PropertiesTable({ onPropertySelect, onAddClick }: PropertiesTableProps) {
  const queryClient = useQueryClient();
  const [pageSize, setPageSize] = React.useState(25);
  const [page, setPage] = React.useState(0);
  const [columnMenuAnchor, setColumnMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [selectedRows, setSelectedRows] = React.useState<GridSelectionModel>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [filterText, setFilterText] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(['name', 'type', 'accounts', 'status', 'created_at', 'updated_at']);

  // Data fetching with React Query
  const { 
    data: properties = [], 
    isLoading,
    error,
    refetch 
  } = useProperties();

  const { selectedProperty, setSelectedProperty } = useSelectedProperty();

  // Delete mutations
  const { mutate: deleteProperty, isPending: isDeleting } = useDeleteProperty();
  const bulkDeleteMutation = useBulkDeleteProperties();

  const handleColumnMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
  };

  const toggleColumn = (field: string) => {
    setVisibleColumns(current => 
      current.includes(field)
        ? current.filter(f => f !== field)
        : [...current, field]
    );
  };

  const defaultColumns = [
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
      valueGetter: (params: { row: Property }) => {
        const type = params.row.type;
        return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'N/A';
      }
    },
    {
      field: 'accounts',
      headerName: 'Parent Accounts',
      width: 250,
      valueGetter: (params: { row: Property }) => {
        const property = params.row;
        if (!property.accounts || property.accounts.length === 0) {
          return 'No Accounts';
        }
        return property.accounts.map(account => account.name).join(', ');
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: { row: Property }) => {
        const status = params.row.status || 'active';
        return <StatusChip status={formatStatus(status)} />;
      }
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 150,
      valueGetter: (params: { row: Property }) => {
        return new Date(params.row.created_at).toLocaleDateString();
      }
    },
    {
      field: 'updated_at',
      headerName: 'Updated',
      width: 150,
      valueGetter: (params: { row: Property }) => {
        return new Date(params.row.updated_at).toLocaleDateString();
      }
    }
  ];

  // Only show columns that are in visibleColumns
  const columns = defaultColumns.filter(col => visibleColumns.includes(col.field));

  const filteredProperties = React.useMemo(() => {
    if (!filterText) return properties;

    const searchText = filterText.toLowerCase();
    return properties.filter((property: Property) => 
      property.name.toLowerCase().includes(searchText) ||
      property.type.toLowerCase().includes(searchText) ||
      property.accounts?.some(account => account.name.toLowerCase().includes(searchText)) ||
      property.status.toLowerCase().includes(searchText)
    );
  }, [properties, filterText]);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    onPropertySelect(property);
  };

  const handleSelectionChange = (newSelection: GridSelectionModel) => {
    setSelectedRows(newSelection);
    if (newSelection.length === 1) {
      const property = properties.find((p: Property) => p.property_id === newSelection[0]);
      if (property) {
        handlePropertySelect(property);
      }
    } else {
      setSelectedProperty(null);
      onPropertySelect(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(selectedRows as string[]);
      setSelectedRows([]);
      setSelectedProperty(null);
      onPropertySelect(null);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete properties:', error);
    }
  };

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Try Again
          </Button>
        }
      >
        Error loading properties: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }

  const isLoaderActive = isLoading || isDeleting || bulkDeleteMutation.isPending;

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center"
          >
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              <TextField
                placeholder="Search properties..."
                variant="outlined"
                size="small"
                fullWidth
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {filteredProperties.length} properties found
            </Typography>
            {selectedRows.length > 0 && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isLoaderActive}
              >
                Delete Selected ({selectedRows.length})
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onAddClick}
              disabled={isLoaderActive}
            >
              Add Property
            </Button>
            <Tooltip title="Select Columns">
              <IconButton onClick={handleColumnMenuOpen}>
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
        rows={filteredProperties || []} // Ensure we always pass an array
        columns={columns}
        getRowId={(row: Property) => row.property_id}
        rowCount={filteredProperties.length}
        loading={isLoaderActive}
        paginationMode="server"
        page={page}
        pageSize={pageSize}
        rowsPerPageOptions={[25, 50, 100]}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        checkboxSelection
        disableSelectionOnClick
        disableColumnMenu
        onRowClick={(params: GridRowParams<Property>) => handlePropertySelect(params.row)}
        selectionModel={selectedRows}
        onSelectionModelChange={handleSelectionChange}
        componentsProps={{
          row: {
            onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
              const id = e.currentTarget.getAttribute('data-id');
              if (id) {
                prefetchProperty(queryClient, id);
              }
            }
          }
        }}
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
            Are you sure you want to delete {selectedRows.length} selected properties? This action cannot be undone.
          </Alert>
          <Typography variant="body2" sx={{ mt: 2 }}>
            All associated data, including addresses, will be permanently deleted.
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
