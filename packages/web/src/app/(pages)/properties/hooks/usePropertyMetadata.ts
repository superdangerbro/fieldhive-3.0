'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';
import { useSetting } from './useSettings';

interface MetadataUpdate {
    type?: string;
    status?: string;
}

export const useUpdatePropertyMetadata = () => {
    const queryClient = useQueryClient();
    const { data: types } = useSetting('property_types');
    const { data: statuses } = useSetting('property_statuses');

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: MetadataUpdate }) => {
            try {
                // Validate type if present
                if (data.type && types && !types.some(t => t.value === data.type)) {
                    throw new Error(`Invalid property type: ${data.type}`);
                }

                // Validate status if present
                if (data.status && statuses && !statuses.some(s => s.value === data.status)) {
                    throw new Error(`Invalid property status: ${data.status}`);
                }

                const url = `${ENV_CONFIG.api.baseUrl}/properties/${id}`;
                console.log('Updating property:', { id, data, url });

                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                console.log('Update response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Update failed:', errorText);
                    throw new Error(errorText || 'Failed to update property');
                }

                const result = await response.json();
                console.log('Update successful:', result);
                return result;
            } catch (error) {
                console.error('Update error:', error);
                throw error;
            }
        },
        onSuccess: (data, { id }) => {
            console.log('Update mutation succeeded, updating cache');
            // Update both the individual property and the properties list
            queryClient.setQueryData(['property', id], data);
            
            // Update the property in the properties list if it exists
            queryClient.setQueriesData({ queryKey: ['properties'] }, (oldData: any) => {
                if (!oldData?.properties) return oldData;
                return {
                    ...oldData,
                    properties: oldData.properties.map((p: any) => 
                        p.property_id === id ? data : p
                    )
                };
            });
            
            // Force refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['properties'] });
            queryClient.invalidateQueries({ queryKey: ['property', id] });
        },
        onError: (error) => {
            console.error('Update mutation failed:', error);
        }
    });
};

export const useDeleteProperty = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            try {
                const url = `${ENV_CONFIG.api.baseUrl}/properties/${id}`;
                console.log('Deleting property:', { id, url });
                
                const response = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Failed to delete property');
                }

                return response.json();
            } catch (error) {
                console.error('Delete error:', error);
                throw error;
            }
        },
        onSuccess: (_, id) => {
            console.log('Delete mutation succeeded, updating cache');
            queryClient.removeQueries({ queryKey: ['property', id] });
            queryClient.invalidateQueries({ queryKey: ['properties'] });
        },
        onError: (error) => {
            console.error('Delete mutation failed:', error);
        }
    });
};
