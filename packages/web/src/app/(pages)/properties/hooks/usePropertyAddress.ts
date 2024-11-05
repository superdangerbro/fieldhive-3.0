import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';
import type { CreateAddressDto } from '@/app/globalTypes/address';
import type { Property } from '@/app/globalTypes/property';

interface UpdateAddressParams {
  propertyId: string;
  type: 'service' | 'billing';
  address: CreateAddressDto;
}

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

export const useUpdatePropertyAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propertyId, type, address }: UpdateAddressParams) => {
      console.log('Updating address:', { propertyId, type, address });

      const response = await fetch(
        buildUrl(`/properties/${propertyId}/address/${type}`),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(address),
          signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to update ${type} address`);
      }

      const updatedProperty = await response.json();
      return updatedProperty;
    },
    onSuccess: (updatedProperty: Property) => {
      // Update both the individual property and the properties list
      queryClient.setQueryData(['property', updatedProperty.property_id], updatedProperty);
      
      // Update the property in the properties list
      queryClient.setQueryData(['properties'], (oldData: any) => {
        if (!oldData?.properties) return oldData;
        return {
          ...oldData,
          properties: oldData.properties.map((property: Property) =>
            property.property_id === updatedProperty.property_id ? updatedProperty : property
          )
        };
      });

      // Invalidate queries to ensure data consistency
      queryClient.invalidateQueries({ 
        queryKey: ['property', updatedProperty.property_id]
      });
    },
  });
};
