'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { EquipmentTypeConfig, FormField } from '../types/components/types';
import type { EquipmentStatus } from '@/app/globalTypes/equipment';
import { ENV_CONFIG } from '@/config/environment';
import { validateApiResponse, validateEquipmentType, validateFieldConfig } from '../types/utils/validation';

const ENDPOINTS = {
    types: '/settings/equipment/types',
    statuses: '/settings/equipment/statuses'
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
    
    // Validate the field before transforming
    const errors = validateFieldConfig(field);
    if (errors.length > 0) {
        console.warn('Field validation errors:', errors);
    }

    const apiField: ApiFieldConfig = {
        name: field.name,
        type: field.type,
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

    console.log('Transformed to API field:', apiField);
    return apiField;
};

// Transform API type to frontend type
const transformApiType = (apiType: ApiEquipmentType): EquipmentTypeConfig => {
    console.log('Transforming API type:', apiType);
    const transformed = {
        value: apiType.name.toLowerCase(),
        label: apiType.name,
        fields: apiType.fields.map(transformApiField)
    };

    // Validate the transformed type
    const errors = validateEquipmentType(transformed);
    if (errors.length > 0) {
        console.warn('Equipment type validation errors:', errors);
    }

    console.log('Transformed to:', transformed);
    return transformed;
};

// Transform frontend type to API type
const transformToApiType = (type: EquipmentTypeConfig): ApiEquipmentType => {
    console.log('Transforming frontend type:', type);
    
    // Validate the type before transforming
    const errors = validateEquipmentType(type);
    if (errors.length > 0) {
        console.warn('Equipment type validation errors:', errors);
    }

    const transformed = {
        name: type.label || type.value,
        fields: type.fields.map(transformToApiField)
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
            const apiTypes = types.map(transformToApiType);
            console.log('Transformed for API:', apiTypes);

            const response = await fetch(buildUrl(ENDPOINTS.types), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiTypes),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            console.log('API update response:', data);

            // Validate API response
            const errors = validateApiResponse(data);
            if (errors.length > 0) {
                console.error('API update response validation errors:', errors);
                throw new Error('Invalid API response: ' + errors.join(', '));
            }

            const transformed = data.map(transformApiType);
            console.log('Transformed update response:', transformed);
            return transformed;
        },
        onSuccess: (data) => {
            console.log('Update successful, setting query data:', data);
            queryClient.setQueryData(['equipmentTypes'], data);
        },
    });
};

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
