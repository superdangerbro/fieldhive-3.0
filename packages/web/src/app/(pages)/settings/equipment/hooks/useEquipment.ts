'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { EquipmentTypeConfig, FormField, Section } from '../types/components/types';
import type { EquipmentStatus } from '@/app/globalTypes/equipment';
import { ENV_CONFIG } from '@/config/environment';
import { validateApiResponse, validateEquipmentType, validateFieldConfig } from '../types/utils/validation';

const ENDPOINTS = {
    types: '/settings/equipment/types',
    statuses: '/settings/equipment/statuses',
    equipment: '/equipment'
} as const;

interface ApiFieldConfig {
    name: string;
    type: string;
    options?: string[];
    required?: boolean;
    description?: string;
    min?: number;
    max?: number;
    step?: number;
}

interface ApiEquipmentType {
    name: string;
    fields: ApiFieldConfig[];
    sections?: Section[];
    barcodeRequired?: boolean;
    photoRequired?: boolean;
    inspectionConfig?: any;
}

// Helper function to build full API URL
const buildUrl = (endpoint: string) => {
    const url = `${ENV_CONFIG.api.baseUrl}${endpoint}`;
    console.log('API URL:', url);
    return url;
};

// Helper function to handle API errors consistently
const handleApiError = async (response: Response) => {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
};

// Transform API field to frontend field
const transformApiField = (apiField: ApiFieldConfig): FormField => {
    console.log('Transforming API field:', apiField);
    const field: FormField = {
        name: apiField.name,
        label: apiField.name,
        type: apiField.type as any,
        required: apiField.required || false,
        description: apiField.description
    };

    // Add config for select fields
    if (apiField.type === 'select' && apiField.options) {
        field.config = {
            options: apiField.options,
            multiple: false
        };
    }

    // Add config for number fields
    if (apiField.type === 'number') {
        const config = {
            min: apiField.min,
            max: apiField.max,
            step: apiField.step
        };
        // Only add config if any values are defined
        if (Object.values(config).some(v => v !== undefined)) {
            field.config = config;
        }
    }

    // Validate the transformed field
    const errors = validateFieldConfig(field);
    if (errors.length > 0) {
        console.warn('Field validation errors:', errors);
    }

    console.log('Transformed to field:', field);
    return field;
};

// Transform frontend field to API field
const transformToApiField = (field: FormField): ApiFieldConfig => {
    console.log('Transforming frontend field:', field);
    
    // Map frontend types to API types
    const typeMap: Record<string, string> = {
        'text': 'text',
        'number': 'number',
        'select': 'select',
        'multiselect': 'select',
        'checkbox': 'checkbox',
        'textarea': 'textarea',
        'boolean': 'checkbox',
        'slider': 'number',
        'capture-flow': 'text' // Map capture-flow to text type
    };

    // Validate the field before transforming
    const errors = validateFieldConfig(field);
    if (errors.length > 0) {
        console.warn('Field validation errors:', errors);
    }

    const apiField: ApiFieldConfig = {
        name: field.name,
        type: typeMap[field.type] || 'text', // Default to text if type not found
        required: field.required || false,
        description: field.description
    };

    // Add type-specific configurations
    if (field.type === 'select' && field.config && 'options' in field.config) {
        apiField.options = field.config.options;
    }

    if (field.type === 'number' && field.config && !('options' in field.config)) {
        if (field.config.min !== undefined) apiField.min = field.config.min;
        if (field.config.max !== undefined) apiField.max = field.config.max;
        if (field.config.step !== undefined) apiField.step = field.config.step;
    }

    if (field.type === 'slider' && field.config) {
        if (field.config.min !== undefined) apiField.min = field.config.min;
        if (field.config.max !== undefined) apiField.max = field.config.max;
        if (field.config.step !== undefined) apiField.step = field.config.step;
    }

    // Handle capture-flow specific config
    if (field.type === 'capture-flow' && field.config) {
        apiField.description = field.config.photoInstructions || field.description;
    }

    console.log('Transformed to API field:', apiField);
    return apiField;
};

// Transform API type to frontend type
const transformApiType = (apiType: ApiEquipmentType): EquipmentTypeConfig => {
    console.log('Transforming API type:', apiType);
    
    const transformed: EquipmentTypeConfig = {
        value: apiType.name,
        label: apiType.name,
        sections: apiType.sections || [],
        barcodeRequired: apiType.barcodeRequired,
        photoRequired: apiType.photoRequired,
        inspectionConfig: apiType.inspectionConfig
    };

    console.log('Transformed to:', transformed);
    return transformed;
};

// Transform frontend type to API type
const transformToApiType = (type: EquipmentTypeConfig): ApiEquipmentType => {
    console.log('Transforming frontend type:', type);
    
    const transformed: ApiEquipmentType = {
        name: type.value,
        fields: [],
        sections: type.sections,
        barcodeRequired: type.barcodeRequired,
        photoRequired: type.photoRequired,
        inspectionConfig: type.inspectionConfig
    };

    console.log('Transformed to API type:', transformed);
    return transformed;
};

// Equipment Types Hooks
export const useEquipmentTypes = () => {
    return useQuery<EquipmentTypeConfig[]>({
        queryKey: ['equipmentTypes'],
        queryFn: async () => {
            console.log('Fetching equipment types...');
            const response = await fetch(buildUrl(ENDPOINTS.types), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('API response:', data);

            // Validate API response
            const errors = validateApiResponse(data);
            if (errors.length > 0) {
                console.error('API response validation errors:', errors);
                throw new Error('Invalid API response: ' + errors.join(', '));
            }

            const transformed = data.map(transformApiType);
            console.log('Transformed types:', transformed);
            return transformed;
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

export const useUpdateEquipmentTypes = () => {
    const queryClient = useQueryClient();

    return useMutation<EquipmentTypeConfig[], Error, EquipmentTypeConfig[]>({
        mutationFn: async (types) => {
            console.log('Updating equipment types with:', types);
            try {
                const apiTypes = types.map(type => {
                    console.log('Transforming type:', type);
                    return transformToApiType(type);
                });
                console.log('Transformed for API:', apiTypes);

                const response = await fetch(buildUrl(ENDPOINTS.types), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(apiTypes),
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API error response:', errorData);
                    
                    // Check if we have validation errors
                    if (errorData.errors && Array.isArray(errorData.errors)) {
                        const validationErrors = errorData.errors
                            .map((err: { type: string; errors: string[] }) => err.errors)
                            .flat()
                            .join(', ');
                        throw new Error(validationErrors);
                    }
                    
                    throw new Error(errorData.message || 'Failed to update equipment type');
                }

                const data = await response.json();
                return data.map(transformApiType);
            } catch (err) {
                console.error('Error updating equipment types:', err);
                throw err;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipmentTypes'] });
        }
    });
};

export const useEquipment = () => {
    const { data: equipmentTypes = [] } = useEquipmentTypes();
    const { data: equipmentStatuses = [] } = useEquipmentStatuses();
    const updateEquipmentStatus = useUpdateEquipmentStatus();

    return {
        equipmentTypes,
        equipmentStatuses,
        updateEquipmentStatus
    };
};

export const defaultFields: FormField[] = [
  {
    name: 'photo',
    type: 'photo',
    label: 'Photo',
    required: true,
    description: 'Take a photo of the equipment'
  },
  {
    name: 'barcode',
    type: 'barcode',
    label: 'Barcode',
    required: true,
    description: 'Scan or enter the barcode'
  },
  {
    name: 'is_interior',
    type: 'boolean',
    label: 'Interior Equipment',
    description: 'Whether this equipment is located inside a building',
    config: {
      defaultValue: false
    }
  },
  {
    name: 'floor',
    type: 'slider',
    label: 'Floor',
    description: 'Floor number where the equipment is located',
    config: {
      min: 1,
      max: 10,
      step: 1,
      marks: [
        { value: 1, label: 'G' },
        { value: 2, label: 'L1' },
        { value: 3, label: 'L2' },
        { value: 4, label: 'L3' },
        { value: 5, label: 'L4' },
        { value: 6, label: 'L5' },
        { value: 7, label: 'L6' },
        { value: 8, label: 'L7' },
        { value: 9, label: 'L8' },
        { value: 10, label: 'L9' }
      ]
    },
    conditions: [
      {
        field: 'is_interior',
        value: true
      }
    ]
  },
  {
    name: 'target_species',
    type: 'select',
    label: 'Target Species',
    required: true,
    description: 'Species this equipment is intended for',
    config: {
      options: ['Mouse', 'Rat', 'Both']
    }
  }
];

// Equipment Statuses Hooks
export const useEquipmentStatuses = () => {
    return useQuery<EquipmentStatus[]>({
        queryKey: ['equipmentStatuses'],
        queryFn: async () => {
            console.log('Fetching equipment statuses...');
            const response = await fetch(buildUrl(ENDPOINTS.statuses), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Equipment statuses response:', data);
            return data.statuses || [];
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

export const useUpdateEquipmentStatuses = () => {
    const queryClient = useQueryClient();

    return useMutation<EquipmentStatus[], Error, EquipmentStatus[]>({
        mutationFn: async (statuses) => {
            console.log('Updating equipment statuses:', statuses);
            const response = await fetch(buildUrl(ENDPOINTS.statuses), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: { statuses } }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('Equipment statuses update response:', data);
            return data.statuses || [];
        },
        onSuccess: (data) => {
            console.log('Update successful, setting query data:', data);
            queryClient.setQueryData(['equipmentStatuses'], data);
        },
    });
};

export const useUpdateEquipmentStatus = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { id: string; status: string }>({
        mutationFn: async ({ id, status }) => {
            console.log('Updating equipment status:', { id, status });

            try {
                // First, get the current equipment data
                const getResponse = await fetch(buildUrl(`${ENDPOINTS.equipment}/${id}`), {
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                });

                if (!getResponse.ok) {
                    const errorData = await getResponse.json().catch(() => ({ message: 'Unknown error occurred' }));
                    throw new Error(errorData.message || `Failed to fetch equipment: ${getResponse.statusText}`);
                }

                const equipment = await getResponse.json();

                // Then update the equipment with the new status
                const updateResponse = await fetch(buildUrl(`${ENDPOINTS.equipment}/${id}`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...equipment,
                        status
                    }),
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                });

                if (!updateResponse.ok) {
                    const errorData = await updateResponse.json().catch(() => ({ message: 'Unknown error occurred' }));
                    throw new Error(errorData.message || `Failed to update equipment status: ${updateResponse.statusText}`);
                }

                const data = await updateResponse.json().catch(() => null);
                return data;
            } catch (error) {
                console.error('Error updating equipment status:', error);
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error('Failed to update equipment status');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipment'] });
        },
    });
};
