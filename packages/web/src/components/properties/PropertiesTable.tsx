'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { getProperties } from '../../services/api';
import { Property, PropertyStatus, PropertyType } from '@fieldhive/shared';
import EditPropertyDialog from './EditPropertyDialog';
import AddPropertyDialog from './AddPropertyDialog';

interface PropertiesTableProps {
  refreshTrigger: number;
}

const getStatusColor = (status: PropertyStatus) => {
  switch (status) {
    case PropertyStatus.ACTIVE:
      return 'success';
    case PropertyStatus.INACTIVE:
      return 'warning';
    case PropertyStatus.ARCHIVED:
      return 'error';
    default:
      return 'default';
  }
};

const formatPropertyType = (type: PropertyType) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

const PropertiesTable: React.FC<PropertiesTableProps> = ({ refreshTrigger }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleEdit = (property: Property) => {
    setEditProperty(property);
  };

  const handleEditSuccess = () => {
    fetchProperties();
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Property Name',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      valueGetter: (params) => formatPropertyType(params.value)
    },
    {
      field: 'accounts',
      headerName: 'Accounts',
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => {
        const accounts = params.value || [];
        return accounts.map((a: any) => a.name).join(', ') || 'No accounts';
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value) as any}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Tooltip title="Edit Property">
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

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await getProperties(page + 1, pageSize);
      setProperties(response.properties || []);
      setTotalRows(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      setProperties([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, pageSize, refreshTrigger]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
          sx={{
            backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
            textTransform: 'none',
          }}
        >
          Add Property
        </Button>
      </Box>

      <Box sx={{ height: 435, width: '100%' }}>
        <DataGrid
          rows={properties}
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
      </Box>

      <EditPropertyDialog
        open={!!editProperty}
        property={editProperty}
        onClose={() => setEditProperty(null)}
        onSuccess={handleEditSuccess}
      />

      <AddPropertyDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </Box>
  );
};

export default PropertiesTable;
