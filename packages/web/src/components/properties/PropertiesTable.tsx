'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Card, CardContent, IconButton, Tooltip, Menu, MenuItem, Checkbox, FormControlLabel, Stack, Typography, TextField, Button } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { getProperties, getAddress } from '../../services/api';
import type { Property, Address, PropertyType } from '@fieldhive/shared';
import { StatusChip, formatStatus } from '../common/PropertyStatus';

interface PropertiesTableProps {
  refreshTrigger?: number;
  onPropertySelect: (property: Property | null) => void;
  selectedProperty: Property | null;
  onPropertiesLoad: (properties: Property[]) => void;
  onAddClick: () => void;
}

export default function PropertiesTable({ 
  refreshTrigger = 0, 
  onPropertySelect,
  selectedProperty,
  onPropertiesLoad,
  onAddClick
}: PropertiesTableProps) {
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['name', 'property_type', 'service_address', 'status']);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const [addressCache, setAddressCache] = useState<Record<string, Address>>({});
  const [filterText, setFilterText] = useState('');

  const loadAddress = async (addressId: string | null | undefined) => {
    if (addressId && !addressCache[addressId]) {
      try {
        const address = await getAddress(addressId);
        setAddressCache(prev => ({ ...prev, [addressId]: address }));
      } catch (error) {
        console.error('Failed to fetch address:', error);
        setAddressCache(prev => ({ ...prev, [addressId]: { 
          address_id: addressId,
          address1: 'Not available',
          city: '',
          province: '',
          postal_code: '',
          country: ''
        }}));
      }
    }
  };

  const formatAddress = (address: Address | undefined) => {
    if (!address) return 'Not set';
    if (address.address1 === 'Not available') return 'Address not available';
    const parts = [
      address.address1,
      address.address2,
      address.city,
      address.province,
      address.postal_code,
      address.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  const defaultColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Property Name',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'property_type',
      headerName: 'Type',
      width: 150,
      valueGetter: (params) => {
        const type = params.value as PropertyType;
        return type.charAt(0).toUpperCase() + type.slice(1);
      }
    },
    {
      field: 'service_address',
      headerName: 'Service Address',
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => {
        const addressId = params.row.service_address_id;
        if (addressId) {
          loadAddress(addressId);
          return formatAddress(addressCache[addressId]);
        }
        return 'Not set';
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const status = params.value || 'active';
        return <StatusChip status={formatStatus(status)} />;
      }
    },
    // Hidden columns
    {
      field: 'property_id',
      headerName: 'Property ID',
      width: 150,
      hide: true
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      width: 200,
      hide: true,
      valueGetter: (params) => new Date(params.value).toLocaleString()
    },
    {
      field: 'updated_at',
      headerName: 'Updated At',
      width: 200,
      hide: true,
      valueGetter: (params) => new Date(params.value).toLocaleString()
    },
    {
      field: 'billing_address',
      headerName: 'Billing Address',
      width: 200,
      hide: true,
      valueGetter: (params) => {
        const addressId = params.row.billing_address_id;
        if (addressId) {
          loadAddress(addressId);
          return formatAddress(addressCache[addressId]);
        }
        return 'Not set';
      }
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 200,
      hide: true,
      valueGetter: (params) => {
        const location = params.value;
        if (location && location.coordinates) {
          return `${location.coordinates[1].toFixed(6)}, ${location.coordinates[0].toFixed(6)}`;
        }
        return 'N/A';
      }
    }
  ];

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

  const columns = defaultColumns.map(col => ({
    ...col,
    hide: !visibleColumns.includes(col.field)
  }));

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await getProperties({
        limit: pageSize,
        offset: page * pageSize
      });
      
      const propertiesData = response.properties;
      setProperties(propertiesData);
      onPropertiesLoad(propertiesData);
      setTotalRows(response.total);

      // Pre-fetch addresses for visible properties
      propertiesData.forEach((property: Property) => {
        if (property.service_address_id) loadAddress(property.service_address_id);
        if (property.billing_address_id) loadAddress(property.billing_address_id);
      });
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, pageSize, refreshTrigger]);

  const filteredProperties = useMemo(() => {
    if (!filterText) return properties;

    const searchText = filterText.toLowerCase();
    return properties.filter(property => {
      const serviceAddress = property.service_address_id ? addressCache[property.service_address_id] : undefined;
      const billingAddress = property.billing_address_id ? addressCache[property.billing_address_id] : undefined;
      
      return (
        property.name.toLowerCase().includes(searchText) ||
        property.property_type.toLowerCase().includes(searchText) ||
        (serviceAddress && formatAddress(serviceAddress).toLowerCase().includes(searchText)) ||
        (billingAddress && formatAddress(billingAddress).toLowerCase().includes(searchText)) ||
        (property.status && property.status.toLowerCase().includes(searchText))
      );
    });
  }, [properties, filterText, addressCache]);

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
        selectionModel={selectedProperty ? [selectedProperty.property_id] : []}
        sx={{
          '& .MuiDataGrid-row': {
            cursor: 'pointer'
          }
        }}
      />
    </Box>
  );
}
