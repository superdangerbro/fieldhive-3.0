'use client';

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import type { Property } from '@/app/globalTypes';
import { useProperties } from './hooks/useProperties';
import { usePropertyUIStore } from './store/uiStore';
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
  const { data: properties = [], isLoading } = useProperties();

  // Use UI store for selected property state
  const { selectedProperty, setSelectedProperty } = usePropertyUIStore();

  // Handle URL-based property selection
  useEffect(() => {
    const propertyId = searchParams.get('property_id');
    if (propertyId && properties.length > 0 && !selectedProperty) {
      const property = properties.find((p: Property) => p.property_id === propertyId);
      if (property) {
        handlePropertySelect(property);
      }
    }
  }, [searchParams, properties, selectedProperty]);

  const handlePropertySelect = (property: Property | null) => {
    if (property) {
      // If we already have the property in our list, use that data
      const existingProperty = properties.find((p: Property) => p.property_id === property.property_id);
      setSelectedProperty(existingProperty || property);
    } else {
      setSelectedProperty(null);
    }
  };

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
