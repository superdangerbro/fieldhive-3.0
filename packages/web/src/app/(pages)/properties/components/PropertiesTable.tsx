'use client';

import React, { useCallback } from 'react';
import { Box, Card, CardContent, IconButton, Tooltip, Menu, MenuItem, Checkbox, FormControlLabel, Stack, Typography, TextField, Button, Alert } from '@mui/material';
import { DataGrid, GridRowParams } from '@mui/x-data-grid';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useQueryClient } from '@tanstack/react-query';
import { usePropertyUIStore } from '../store/uiStore';
import { useProperties, useDeleteProperty, prefetchProperty } from '../hooks/useProperties';
import type { Property } from '../../../globalTypes/property';
import { StatusChip, formatStatus } from './PropertyStatus';

interface PropertiesTableProps {
  onPropertySelect: (property: Property | null) => void;
  onAddClick: () => void;
}

export default function PropertiesTable({ onPropertySelect, onAddClick }: PropertiesTableProps) {
  const queryClient = useQueryClient();
  const [pageSize, setPageSize] = React.useState(25);
  const [page, setPage] = React.useState(0);
  const [columnMenuAnchor, setColumnMenuAnchor] = React.useState<null | HTMLElement>(null);

  // UI state from Zustand
  const {
    selectedProperty,
    visibleColumns,
    filterText,
    setSelectedProperty,
    toggleColumn,
    setFilterText
  } = usePropertyUIStore();

  // Data fetching with React Query
  const { 
    data: properties = [], 
    isLoading,
    error,
    refetch 
  } = useProperties({
    limit: pageSize,
    offset: page * pageSize
  });

  // Delete mutation
  const { mutate: deleteProperty, isPending: isDeleting } = useDeleteProperty();

  const handleColumnMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
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
      valueGetter: (params: any) => {
        const type = params.value as string;
        return type.charAt(0).toUpperCase() + type.slice(1);
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: any) => {
        const status = params.value || 'active';
        return <StatusChip status={formatStatus(status)} />;
      }
    }
  ];

  const columns = defaultColumns.map(col => ({
    ...col,
    hide: !visibleColumns.includes(col.field)
  }));

  const filteredProperties = React.useMemo(() => {
    if (!filterText) return properties;

    const searchText = filterText.toLowerCase();
    return properties.filter((property: Property) => 
      property.name.toLowerCase().includes(searchText) ||
      property.type.toLowerCase().includes(searchText) ||
      (property.status && property.status.toLowerCase().includes(searchText))
    );
  }, [properties, filterText]);

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    onPropertySelect(property);
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
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onAddClick}
              disabled={isLoading || isDeleting}
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
        rows={filteredProperties}
        columns={columns}
        getRowId={(row) => row.property_id}
        rowCount={filteredProperties.length}
        loading={isLoading || isDeleting}
        paginationMode="server"
        page={page}
        pageSize={pageSize}
        rowsPerPageOptions={[25, 50, 100]}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        disableSelectionOnClick
        disableColumnMenu
        onRowClick={(params: GridRowParams<Property>) => handlePropertySelect(params.row)}
        selectionModel={selectedProperty ? [selectedProperty.property_id] : []}
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
    </Box>
  );
}
