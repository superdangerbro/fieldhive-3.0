'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import PropertyDetails from '../../components/properties/PropertyDetails';
import PropertiesTable from '../../components/properties/PropertiesTable';
import AddPropertyDialog from '../../components/properties/AddPropertyDialog';
import EditPropertyDialog from '../../components/properties/EditPropertyDialog';
import PropertySearch from '../../components/properties/PropertySearch';
import { usePersistedProperty } from '../../hooks/usePersistedProperty';
import type { Property } from '@fieldhive/shared';

export default function PropertiesPage() {
  const [selectedProperty, setSelectedProperty] = usePersistedProperty();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filterText, setFilterText] = useState('');

  const handleAddSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsAddDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setEditProperty(null);
  };

  const handlePropertySelect = (property: Property | null) => {
    // If the property is deleted, remove it from persistence
    if (!property || !properties.find(p => p.property_id === property.property_id)) {
      setSelectedProperty(null);
    } else {
      setSelectedProperty(property);
    }
    // Update filter text when property is selected from autocomplete
    if (property) {
      setFilterText(property.name);
    }
  };

  const handleEdit = (property: Property) => {
    setEditProperty(property);
  };

  const handlePropertiesLoad = (loadedProperties: Property[]) => {
    setProperties(loadedProperties);
    // If the selected property no longer exists in the loaded properties, clear it
    if (selectedProperty && !loadedProperties.find(p => p.property_id === selectedProperty.property_id)) {
      setSelectedProperty(null);
    }
  };

  const handleUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Box p={3}>
      <PropertyDetails
        property={selectedProperty}
        onEdit={handleEdit}
        onUpdate={handleUpdate}
        onPropertySelect={handlePropertySelect}
      />
      
      <PropertySearch
        properties={properties}
        selectedProperty={selectedProperty}
        onPropertySelect={handlePropertySelect}
        onAddClick={() => setIsAddDialogOpen(true)}
      />

      <PropertiesTable 
        refreshTrigger={refreshTrigger}
        onPropertySelect={handlePropertySelect}
        selectedProperty={selectedProperty}
        onPropertiesLoad={handlePropertiesLoad}
        filterText={filterText}
      />
      
      <AddPropertyDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />
      {editProperty && (
        <EditPropertyDialog
          open={!!editProperty}
          property={editProperty}
          onClose={() => setEditProperty(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </Box>
  );
}
