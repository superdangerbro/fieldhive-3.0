'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import type { Property } from '@fieldhive/shared';

// Import all components from their new locations
import PropertyDetails from './components/PropertyDetails';
import PropertiesTable from './components/PropertiesTable';
import AddPropertyDialog from './components/AddPropertyDialog';
import EditPropertyDialog from './components/EditPropertyDialog';

export default function PropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editProperty, setEditProperty] = useState<Property | null>(null);

  const handlePropertySelect = (property: Property | null) => {
    setSelectedProperty(property);
  };

  const handleUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePropertiesLoad = (loadedProperties: Property[]) => {
    setProperties(loadedProperties);
    // If the selected property exists in loaded properties, update it
    if (selectedProperty) {
      const updatedProperty = loadedProperties.find(p => p.property_id === selectedProperty.property_id);
      if (updatedProperty) {
        setSelectedProperty(updatedProperty);
      } else {
        setSelectedProperty(null);
      }
    }
  };

  return (
    <Box p={3}>
      {selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onEdit={setEditProperty}
          onUpdate={handleUpdate}
          onPropertySelect={handlePropertySelect}
        />
      )}

      <PropertiesTable 
        refreshTrigger={refreshTrigger}
        onPropertySelect={handlePropertySelect}
        selectedProperty={selectedProperty}
        onPropertiesLoad={handlePropertiesLoad}
        onAddClick={() => setIsAddDialogOpen(true)}
      />

      <AddPropertyDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleUpdate}
      />

      <EditPropertyDialog
        open={!!editProperty}
        property={editProperty}
        onClose={() => setEditProperty(null)}
        onSuccess={handleUpdate}
      />
    </Box>
  );
}
