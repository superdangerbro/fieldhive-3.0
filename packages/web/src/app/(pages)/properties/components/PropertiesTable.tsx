'use client';

import React from 'react';
import { 
    Box, 
    Card,
    Alert,
    Button,
} from '@mui/material';
import { 
    DataGrid, 
    GridPaginationModel,
    GridRowSelectionModel,
    GridEventListener,
} from '@mui/x-data-grid';
import { useQueryClient } from '@tanstack/react-query';
import { useProperties } from '../hooks/usePropertyList';
import { useDeleteProperty, useBulkDeleteProperties } from '../hooks/usePropertyDelete';
import { PropertiesTableToolbar } from './PropertiesTableToolbar';
import { DeletePropertiesDialog } from '../dialogs/DeletePropertiesDialog';
import { defaultColumns, filterProperties } from './PropertiesTableColumns';
import type { Property } from '../../../globalTypes/property';

interface PropertiesTableProps {
    onPropertySelect: (property: Property | null) => void;
    selectedProperty: Property | null;
    onAddClick: () => void;
}

export default function PropertiesTable({ 
    onPropertySelect, 
    selectedProperty,
    onAddClick 
}: PropertiesTableProps) {
    const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
        pageSize: 25,
        page: 0
    });
    const [bulkSelection, setBulkSelection] = React.useState<GridRowSelectionModel>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [filterText, setFilterText] = React.useState('');
    const [visibleColumns, setVisibleColumns] = React.useState(['name', 'type', 'accounts', 'status', 'created_at', 'updated_at']);

    // Data fetching with React Query
    const { 
        data: properties = [], 
        isLoading,
        error,
        refetch 
    } = useProperties();

    // Delete mutations
    const { mutate: deleteProperty, isPending: isDeleting } = useDeleteProperty();
    const { mutateAsync: bulkDelete, isPending: isBulkDeleting } = useBulkDeleteProperties();

    const handleRowClick: GridEventListener<'rowClick'> = (params, event) => {
        // Check if the click target is an input element (checkbox)
        const target = event.target as HTMLElement;
        if (target.tagName.toLowerCase() === 'input') return;
        
        const property = properties.find(p => p.property_id === params.id);
        if (property) {
            console.log('Selecting property:', property);
            onPropertySelect(property);
        }
    };

    // Handle checkbox selection (for bulk actions)
    const handleBulkSelection = (newSelection: GridRowSelectionModel) => {
        setBulkSelection(newSelection);
    };

    const handleBulkDelete = async () => {
        try {
            await bulkDelete(bulkSelection as string[]);
            setBulkSelection([]);
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error('Failed to delete properties:', error);
        }
    };

    const toggleColumn = (field: string) => {
        setVisibleColumns(current => 
            current.includes(field)
                ? current.filter(f => f !== field)
                : [...current, field]
        );
    };

    // Filter and sort properties
    const filteredProperties = React.useMemo(() => 
        filterProperties(properties, filterText),
        [properties, filterText]
    );

    // Only show columns that are in visibleColumns
    const columns = defaultColumns.filter(col => visibleColumns.includes(col.field));

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

    const isLoaderActive = isLoading || isDeleting || isBulkDeleting;

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <Card sx={{ mb: 2 }}>
                <PropertiesTableToolbar 
                    filterText={filterText}
                    onFilterChange={setFilterText}
                    totalProperties={filteredProperties.length}
                    selectedCount={bulkSelection.length}
                    onDeleteSelected={() => setDeleteDialogOpen(true)}
                    onAddProperty={onAddClick}
                    isLoading={isLoaderActive}
                    visibleColumns={visibleColumns}
                    onToggleColumn={toggleColumn}
                    availableColumns={defaultColumns}
                />
            </Card>

            <DataGrid
                rows={filteredProperties}
                columns={columns}
                getRowId={(row: Property) => row.property_id}
                loading={isLoaderActive}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                paginationMode="client"
                pageSizeOptions={[25, 50, 100]}
                checkboxSelection
                disableRowSelectionOnClick
                onRowClick={handleRowClick}
                rowSelectionModel={bulkSelection}
                onRowSelectionModelChange={handleBulkSelection}
                getRowClassName={(params) => 
                    params.id === selectedProperty?.property_id ? 'Mui-selected' : ''
                }
                sx={{
                    '& .MuiDataGrid-row': {
                        cursor: 'pointer'
                    },
                    '& .Mui-selected': {
                        backgroundColor: 'primary.main !important',
                        color: 'primary.contrastText',
                        '&:hover': {
                            backgroundColor: 'primary.dark !important',
                        }
                    }
                }}
            />

            <DeletePropertiesDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleBulkDelete}
                selectedCount={bulkSelection.length}
                isDeleting={isBulkDeleting}
            />
        </Box>
    );
}
