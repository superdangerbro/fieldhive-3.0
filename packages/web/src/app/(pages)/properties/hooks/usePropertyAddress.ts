'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';
import type { CreateAddressDto } from '@/app/globalTypes/address';
import type { Property } from '@/app/globalTypes/property';
import { useUpdateAddress, useCreateAddress } from './useAddresses';
import { useUpdatePropertyMetadata } from './usePropertyMetadata';
import { handleApiError } from './utils';

interface UpdateAddressParams {
  propertyId: string;
  type: 'service' | 'billing';
  address: CreateAddressDto;
}

export const useUpdatePropertyAddress = () => {
  const queryClient = useQueryClient();
  const updateAddress = useUpdateAddress();
  const createAddress = useCreateAddress();
  const updateProperty = useUpdatePropertyMetadata();

  return useMutation({
    mutationFn: async ({ propertyId, type, address }: UpdateAddressParams) => {
      console.log('Updating property address:', { propertyId, type, address });

      // Get current property data
      const response = await fetch(
        `${ENV_CONFIG.api.baseUrl}/properties/${propertyId}`,
        {
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
        }
      );

      if (!response.ok) {
        await handleApiError(response);
      }

      const property = await response.json();
      const existingAddress = type === 'service' ? property.serviceAddress : property.billingAddress;

      // Update or create address
      let addressResult;
      if (existingAddress?.address_id) {
        // Update existing address
        addressResult = await updateAddress.mutateAsync({
          id: existingAddress.address_id,
          data: address
        });
      } else {
        // Create new address
        addressResult = await createAddress.mutateAsync(address);

        // Update property with new address ID
        await updateProperty.mutateAsync({
          id: propertyId,
          data: {
            [`${type}_address_id`]: addressResult.address_id
          }
        });
      }

      // Fetch updated property
      const updatedResponse = await fetch(
        `${ENV_CONFIG.api.baseUrl}/properties/${propertyId}`,
        {
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
        }
      );

      if (!updatedResponse.ok) {
        await handleApiError(updatedResponse);
      }

      const updatedProperty = await updatedResponse.json();
      console.log('Address update complete:', updatedProperty);
      return updatedProperty;
    },
    onSuccess: (updatedProperty: Property) => {
      console.log('Address update successful, updating cache');
      
      // Update both the individual property and the properties list
      queryClient.setQueryData(['property', updatedProperty.property_id], updatedProperty);
      
      // Update the property in the properties list
      queryClient.setQueriesData({ queryKey: ['properties'] }, (oldData: any) => {
        if (!oldData?.properties) return oldData;
        return {
          ...oldData,
          properties: oldData.properties.map((property: Property) =>
            property.property_id === updatedProperty.property_id ? updatedProperty : property
          )
        };
      });

      // Force refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ 
        queryKey: ['property', updatedProperty.property_id]
      });
    },
    onError: (error) => {
      console.error('Address update failed:', error);
    }
  });
};
