'use client';

import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import type { Property } from '../../globalTypes/property';
import { useProperties } from './hooks/usePropertyList';
import { useSelectedProperty } from './hooks/useSelectedProperty';
import { useSearchParams } from 'next/navigation';
import PropertyDetails from './components/PropertyDetails';
import PropertiesTable from './components/PropertiesTable';
import AddPropertyDialog from './dialogs/AddPropertyDialog';
import EditPropertyDialog from './dialogs/EditPropertyDialog';

export default function PropertiesPage() {
    const searchParams = useSearchParams();
    
    // Dialog state
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editProperty, setEditProperty] = useState<Property | null>(null);

    // Get properties data from React Query
    const { 
        data: properties = [], 
        isLoading: propertiesLoading,
        error: propertiesError,
        refetch: refetchProperties
    } = useProperties();

    // Get selected property state
    const { selectedProperty, setSelectedProperty } = useSelectedProperty();

    // Handle URL-based property selection on initial load
    useEffect(() => {
        const propertyId = searchParams.get('property_id');
        if (propertyId && properties.length > 0 && !selectedProperty) {
            const property = properties.find(p => p.property_id === propertyId);
            if (property) {
                setSelectedProperty(property);
            }
        }
    }, [searchParams, properties, selectedProperty, setSelectedProperty]);

    // Handle property selection
    const handlePropertySelect = (property: Property | null) => {
        console.log('handlePropertySelect called with:', property);
        // First update local state
        setSelectedProperty(property);
    };

    if (propertiesLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
            </Box>
        );
    }

    if (propertiesError) {
        return (
            <Box p={3}>
                <Alert 
                    severity="error" 
                    action={
                        <Button 
                            color="inherit" 
                            size="small" 
                            onClick={() => refetchProperties()}
                        >
                            Try Again
                        </Button>
                    }
                >
                    Failed to load properties: {propertiesError instanceof Error ? propertiesError.message : 'Unknown error'}
                </Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            {selectedProperty && (
                <PropertyDetails
                    property={selectedProperty}
                    onEdit={setEditProperty}
                    onPropertySelect={handlePropertySelect}
                />
            )}

            <PropertiesTable 
                onPropertySelect={handlePropertySelect}
                selectedProperty={selectedProperty}
                onAddClick={() => setIsAddDialogOpen(true)}
            />

            <AddPropertyDialog
                open={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
            />

            {editProperty && (
                <EditPropertyDialog
                    open={true}
                    property={editProperty}
                    onClose={() => setEditProperty(null)}
                />
            )}
        </Box>
    );
}
