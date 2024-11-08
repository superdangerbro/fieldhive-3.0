'use client';

import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import type { Property } from '@/app/globalTypes/property';
import { useProperties, useProperty } from './hooks/usePropertyList';
import { useSelectedProperty } from './hooks/useSelectedProperty';
import { useSearchParams } from 'next/navigation';

// Import all components from their new locations
import PropertyDetails from './components/PropertyDetails';
import PropertiesTable from './components/PropertiesTable';
import AddPropertyDialog from './dialogs/AddPropertyDialog';
import EditPropertyDialog from './dialogs/EditPropertyDialog';

export default function PropertiesPage() {
  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const searchParams = useSearchParams();

  // Get properties data from React Query
  const { 
    data: properties = [], 
    isLoading: propertiesLoading,
    error: propertiesError,
    refetch: refetchProperties
  } = useProperties();

  const { selectedProperty, setSelectedProperty } = useSelectedProperty();

  // Fetch full property data when selected
  const { 
    data: propertyDetails,
    isLoading: propertyLoading,
    error: propertyError,
    refetch: refetchProperty
  } = useProperty(selectedProperty?.property_id || null);

  // Handle URL-based property selection
  useEffect(() => {
    const propertyId = searchParams.get('property_id');
    if (propertyId && properties.length > 0 && !selectedProperty) {
      console.log('Selecting property from URL:', propertyId);
      const property = properties.find((p: Property) => p.property_id === propertyId);
      if (property) {
        handlePropertySelect(property);
      }
    }
  }, [searchParams, properties, selectedProperty]);

  const handlePropertySelect = async (property: Property | null) => {
    console.log('Property selected:', property?.property_id);
    if (property) {
      // If we already have the property in our list, use that data
      const existingProperty = properties.find((p: Property) => p.property_id === property.property_id);
      setSelectedProperty(existingProperty || property);
      
      // Fetch full property details
      if (existingProperty?.property_id) {
        await refetchProperty();
      }
    } else {
      setSelectedProperty(null);
    }
  };

  const isLoading = propertiesLoading || propertyLoading;
  const error = propertiesError || propertyError;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                refetchProperties();
                if (selectedProperty?.property_id) {
                  refetchProperty();
                }
              }}
            >
              Try Again
            </Button>
          }
        >
          Failed to load properties: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  // Use propertyDetails if available, otherwise fall back to selectedProperty
  const currentProperty = propertyDetails || selectedProperty;

  return (
    <Box p={3}>
      {currentProperty && (
        <PropertyDetails
          property={currentProperty}
          onEdit={setEditProperty}
          onPropertySelect={handlePropertySelect}
        />
      )}

      <PropertiesTable 
        onPropertySelect={handlePropertySelect}
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
