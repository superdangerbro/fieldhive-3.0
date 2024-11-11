'use client';

import React, { useCallback } from 'react';
import { GridRowParams, GridRowSelectionModel } from '@mui/x-data-grid';
import type { Property } from '../../../globalTypes/property';

interface PropertiesTableActionsProps {
    properties: Property[];
    selectedRows: GridRowSelectionModel;
    onPropertySelect: (property: Property | null) => void;
    setSelectedRows: (rows: GridRowSelectionModel) => void;
    setSelectedProperty: (property: Property | null) => void;
}

export function usePropertiesTableActions({
    properties,
    selectedRows,
    onPropertySelect,
    setSelectedRows,
    setSelectedProperty
}: PropertiesTableActionsProps) {
    const handlePropertySelect = useCallback((property: Property) => {
        // Update both the local state and parent component
        setSelectedProperty(property);
        onPropertySelect(property);
    }, [setSelectedProperty, onPropertySelect]);

    const handleRowClick = useCallback((params: GridRowParams<Property>) => {
        // Update selection and trigger property select
        handlePropertySelect(params.row);
        setSelectedRows([params.row.property_id]);
    }, [handlePropertySelect, setSelectedRows]);

    const handleSelectionChange = useCallback((newSelection: GridRowSelectionModel) => {
        setSelectedRows(newSelection);
        
        // Handle single selection
        if (newSelection.length === 1) {
            const property = properties.find((p: Property) => p.property_id === newSelection[0]);
            if (property) {
                handlePropertySelect(property);
            }
        } else {
            // Clear selection if multiple or no rows selected
            setSelectedProperty(null);
            onPropertySelect(null);
        }
    }, [properties, handlePropertySelect, setSelectedRows, setSelectedProperty, onPropertySelect]);

    return {
        handleRowClick,
        handleSelectionChange
    };
}

export function usePropertiesTableBulkActions({
    selectedRows,
    setSelectedRows,
    setSelectedProperty,
    onPropertySelect,
    bulkDeleteMutation,
    setDeleteDialogOpen
}: {
    selectedRows: GridRowSelectionModel;
    setSelectedRows: (rows: GridRowSelectionModel) => void;
    setSelectedProperty: (property: Property | null) => void;
    onPropertySelect: (property: Property | null) => void;
    bulkDeleteMutation: any;
    setDeleteDialogOpen: (open: boolean) => void;
}) {
    const handleBulkDelete = async () => {
        try {
            await bulkDeleteMutation.mutateAsync(selectedRows as string[]);
            
            // Clear selections after successful delete
            setSelectedRows([]);
            setSelectedProperty(null);
            onPropertySelect(null);
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error('Failed to delete properties:', error);
        }
    };

    return {
        handleBulkDelete
    };
}
