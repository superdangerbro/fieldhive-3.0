'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../config/environment';
import { handleApiError, buildApiRequest, retryWithBackoff } from './utils';
import { useSetting } from './useSettings';
import type { Property } from '../../../globalTypes/property';

interface MetadataUpdate {
    type?: string;
    status?: string;
}

interface PropertiesResponse {
    properties: Property[];
    total: number;
    limit: number;
    offset: number;
}

export const useUpdatePropertyMetadata = () => {
    const queryClient = useQueryClient();
    const { data: types } = useSetting('property_types');
    const { data: statuses } = useSetting('property_statuses');

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: MetadataUpdate }) => {
            // Validate type if present
            if (data.type && types && !types.some(t => t.value === data.type)) {
                throw new Error(`Invalid property type: ${data.type}`);
            }

            // Validate status if present
            if (data.status && statuses && !statuses.some(s => s.value === data.status)) {
                throw new Error(`Invalid property status: ${data.status}`);
            }

            console.log('Updating property metadata:', { id, data });
            const url = `${ENV_CONFIG.api.baseUrl}/properties/${id}`;

            return retryWithBackoff(async () => {
                const response = await fetch(url, buildApiRequest({
                    method: 'PUT',
                    body: JSON.stringify(data)
                }));

                if (!response.ok) {
                    await handleApiError(response);
                }

                const result = await response.json();
                console.log('Update response:', result);
                return result;
            });
        },
        onSuccess: (updatedProperty: Property, { id }) => {
            console.log('Metadata update successful:', updatedProperty);

            // Update the individual property cache
            queryClient.setQueryData(['property', id], updatedProperty);
            
            // Update the property in the properties list if it exists
            queryClient.setQueriesData<PropertiesResponse | undefined>(
                { queryKey: ['properties'] }, 
                (oldData) => {
                    if (!oldData?.properties) return oldData;
                    
                    return {
                        ...oldData,
                        properties: oldData.properties.map((p: Property) => 
                            p.property_id === id ? updatedProperty : p
                        )
                    };
                }
            );

            // Update the selected property if this is the currently selected one
            queryClient.setQueriesData<Property | null | undefined>(
                { queryKey: ['selectedProperty'] },
                (oldData) => {
                    if (!oldData) return oldData;
                    if (oldData.property_id === id) {
                        return updatedProperty;
                    }
                    return oldData;
                }
            );
            
            // Invalidate queries to ensure consistency
            queryClient.invalidateQueries({ 
                queryKey: ['properties'],
                refetchType: 'none' // Don't refetch immediately since we've already updated the cache
            });
            queryClient.invalidateQueries({ 
                queryKey: ['property', id],
                refetchType: 'none'
            });
        },
        onError: (error, { id }) => {
            console.error('Metadata update failed:', error);
            
            // Invalidate caches to ensure fresh data on next fetch
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            queryClient.invalidateQueries({ queryKey: ['property', id] });
            
            // Optionally refetch the property to ensure consistent state
            queryClient.refetchQueries({ queryKey: ['property', id] });
        }
    });
};
