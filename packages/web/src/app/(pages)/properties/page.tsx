'use client';

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import type { Property } from '../../globalTypes/property';
import { usePropertyStore } from './store/propertyStore';

// Import all components from their new locations
import PropertyDetails from './components/PropertyDetails';
import PropertiesTable from './components/PropertiesTable';
import AddPropertyDialog from './dialogs/AddPropertyDialog';
import EditPropertyDialog from './dialogs/EditPropertyDialog';

export default function PropertiesPage() {
  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editProperty, setEditProperty] = useState<Property | null>(null);

  // Get state from Zustand store
  const { selectedProperty, setSelectedProperty } = usePropertyStore();

  const handlePropertySelect = (property: Property | null) => {
    setSelectedProperty(property);
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
        selectedProperty={selectedProperty}
      />

      <AddPropertyDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onPropertyAdded={handlePropertySelect}
      />

      <EditPropertyDialog
        open={!!editProperty}
        property={editProperty}
        onClose={() => setEditProperty(null)}
        onPropertyUpdated={handlePropertySelect}
      />
    </Box>
  );
}
