import React, { useState, useEffect } from 'react';
import { Box, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getProperties, deleteProperty } from '../../services/api';
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
  return type?.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ') || 'Unknown';
};

const PropertiesTable: React.FC<PropertiesTableProps> = ({ refreshTrigger }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleEdit = (property: Property) => {
    setEditProperty(property);
  };

  const handleDelete = async (property: Property) => {
    try {
      await deleteProperty(property.id);
      fetchProperties();
    } catch (error: any) {
      if (error.message?.includes('jobs exist')) {
        alert('Cannot delete property with existing jobs');
      } else {
        alert('Failed to delete property');
      }
    }
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
          label={params.value || 'Unknown'}
          color={getStatusColor(params.value) as any}
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit Property">
            <IconButton
              onClick={() => handleEdit(params.row)}
              size="small"
              sx={{ color: 'primary.main' }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Property">
            <IconButton
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this property?')) {
                  handleDelete(params.row);
                }
              }}
              size="small"
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await getProperties();
      console.log('Properties response:', response); // Debug log
      setProperties(response.properties || []);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [refreshTrigger]);

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
          loading={loading}
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
