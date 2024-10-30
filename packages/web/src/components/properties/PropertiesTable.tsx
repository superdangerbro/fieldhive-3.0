'use client';

import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, IconButton, Tooltip, Menu, MenuItem, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { getProperties } from '../../services/api';
import type { Property } from '@fieldhive/shared';
import { StatusChip } from './PropertyDetails';

interface PropertiesTableProps {
  refreshTrigger?: number;
  onPropertySelect: (property: Property | null) => void;
  selectedProperty: Property | null;
  onPropertiesLoad: (properties: Property[]) => void;
  filterText: string;
}

const defaultColumns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Property Name',
    flex: 1,
    minWidth: 200
  },
  {
    field: 'billing_address',
    headerName: 'Billing Address',
    flex: 1,
    minWidth: 200,
    valueGetter: (params: any) => {
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
    field: 'service_address',
    headerName: 'Service Address',
    flex: 1,
    minWidth: 200,
    valueGetter: (params: any) => {
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
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => {
      const status = params.value?.charAt(0).toUpperCase() + params.value?.slice(1).toLowerCase() || 'Active';
      return <StatusChip status={status} />;
    }
  }
];

export default function PropertiesTable({ 
  refreshTrigger = 0, 
  onPropertySelect,
  selectedProperty,
  onPropertiesLoad,
  filterText
}: PropertiesTableProps) {
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
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

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await getProperties({
        limit: pageSize,
        offset: page * pageSize,
        search: filterText
      });
      
      const propertiesData = response.properties;
      setProperties(propertiesData);
      onPropertiesLoad(propertiesData);
      setTotalRows(response.total);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
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
                {totalRows} properties found
              </Typography>
            </Box>
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
        rows={properties}
        columns={columns}
        getRowId={(row) => (row as any).property_id || row.id}
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
        onRowClick={(params) => onPropertySelect(params.row as Property)}
        selectionModel={selectedProperty ? [(selectedProperty as any).property_id || selectedProperty.id] : []}
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer'
          }
        }}
      />
    </Box>
  );
}
