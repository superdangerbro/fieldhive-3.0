import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';
import type { Property } from '@/app/globalTypes/property';

const PROPERTIES_ENDPOINT = '/properties';

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

interface UpdatePropertyData {
  id: string;
  data: Partial<Property>;
}

// Update property
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdatePropertyData) => {
      const response = await fetch(buildUrl(`${PROPERTIES_ENDPOINT}/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update property');
      }

      const updatedProperty = await response.json();
      return updatedProperty;
    },
    onSuccess: (updatedProperty, { id }) => {
      // Update both the individual property and the properties list
      queryClient.setQueryData(['property', id], updatedProperty);
      
      // Update the property in the properties list
      queryClient.setQueryData(['properties'], (oldData: any) => {
        if (!oldData?.properties) return oldData;
        return {
          ...oldData,
          properties: oldData.properties.map((property: Property) =>
            property.property_id === id ? updatedProperty : property
          )
        };
      });
    },
  });
};

// Update property metadata
export const useUpdatePropertyMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdatePropertyData) => {
      const response = await fetch(buildUrl(`${PROPERTIES_ENDPOINT}/${id}/metadata`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update property metadata');
      }

      const updatedProperty = await response.json();
      return updatedProperty;
    },
    onSuccess: (updatedProperty, { id }) => {
      // Update both the individual property and the properties list
      queryClient.setQueryData(['property', id], updatedProperty);
      
      // Update the property in the properties list
      queryClient.setQueryData(['properties'], (oldData: any) => {
        if (!oldData?.properties) return oldData;
        return {
          ...oldData,
          properties: oldData.properties.map((property: Property) =>
            property.property_id === id ? updatedProperty : property
          )
        };
      });
    },
  });
};

// Delete property
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(buildUrl(`${PROPERTIES_ENDPOINT}/${id}`), {
        method: 'DELETE',
        signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete property');
      }

      return response.json();
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['property', id] });
      
      // Update properties list
      queryClient.setQueryData(['properties'], (oldData: any) => {
        if (!oldData?.properties) return oldData;
        return {
          ...oldData,
          properties: oldData.properties.filter((property: Property) => 
            property.property_id !== id
          )
        };
      });
    },
  });
};
