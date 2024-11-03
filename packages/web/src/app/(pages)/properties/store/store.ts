'use client';

import { create } from 'zustand';
import { Property, CreatePropertyDto, UpdatePropertyDto, Address, Account } from '@/app/globaltypes';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const PROPERTIES_ENDPOINT = '/properties';

interface PropertyStore {
    // State
    properties: Property[];
    selectedProperty: Property | null;
    isLoading: boolean;
    error: string | null;

    // Selection Actions
    setSelectedProperty: (property: Property | null) => void;
    setProperties: (properties: Property[]) => void;

    // CRUD Actions
    fetchProperties: (params?: { 
        search?: string; 
        limit?: number; 
        offset?: number; 
        accountId?: string 
    }) => Promise<void>;
    getPropertiesInBounds: (bounds: [number, number, number, number]) => Promise<void>;
    createProperty: (data: CreatePropertyDto) => Promise<void>;
    updateProperty: (id: string, data: UpdatePropertyDto) => Promise<void>;
    deleteProperty: (id: string) => Promise<{ success: boolean; error?: string; canArchive?: boolean }>;
    archiveProperty: (id: string) => Promise<{ success: boolean }>;

    // Metadata Actions
    updatePropertyMetadata: (id: string, metadata: { 
        property_type?: string; 
        status?: string 
    }) => Promise<void>;

    // Additional Actions
    getPropertyLocation: (id: string) => Promise<any>;
    getPropertyAddresses: (id: string) => Promise<{ 
        billing_address: Address | null, 
        service_address: Address | null 
    }>;
    getPropertyAccounts: (propertyId: string) => Promise<Account[]>;
}

// Helper function to convert API response to Property type
const convertToProperty = (data: any): Property => ({
    ...data,
    created_at: data.created_at ? new Date(data.created_at) : undefined,
    updated_at: data.updated_at ? new Date(data.updated_at) : undefined
});

export const usePropertyStore = create<PropertyStore>((set, get) => ({
    // Initial state
    properties: [],
    selectedProperty: null,
    isLoading: false,
    error: null,

    // Selection Actions
    setSelectedProperty: (property) => {
        set({ selectedProperty: property });
    },

    setProperties: (properties) => {
        set({ properties });
    },

    // CRUD Actions
    fetchProperties: async (params) => {
        try {
            set({ isLoading: true, error: null });
            const searchParams = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) {
                        searchParams.append(key, String(value));
                    }
                });
            }
            const response = await fetch(`${BASE_URL}${PROPERTIES_ENDPOINT}?${searchParams}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch properties');
            }

            const data = await response.json();
            const properties = data.properties.map(convertToProperty);
            set({ properties });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch properties' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    getPropertiesInBounds: async (bounds) => {
        try {
            set({ isLoading: true, error: null });
            const [west, south, east, north] = bounds;
            const response = await fetch(`${BASE_URL}${PROPERTIES_ENDPOINT}/spatial/bounds?bounds=${west},${south},${east},${north}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch properties in bounds');
            }

            const data = await response.json();
            const properties = data.properties.map(convertToProperty);
            set({ properties });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch properties in bounds' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    createProperty: async (data) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${PROPERTIES_ENDPOINT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to create property');
            }

            const newProperty = convertToProperty(await response.json());
            set(state => ({
                properties: [...state.properties, newProperty]
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to create property' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateProperty: async (id, data) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${PROPERTIES_ENDPOINT}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to update property');
            }

            const updatedProperty = convertToProperty(await response.json());
            set(state => ({
                properties: state.properties.map(p => 
                    p.property_id === id ? updatedProperty : p
                ),
                selectedProperty: state.selectedProperty?.property_id === id ? 
                    updatedProperty : state.selectedProperty
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update property' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deleteProperty: async (id) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${PROPERTIES_ENDPOINT}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete property');
            }

            const result = await response.json();
            if (result.success) {
                set(state => ({
                    properties: state.properties.filter(p => p.property_id !== id),
                    selectedProperty: state.selectedProperty?.property_id === id ? 
                        null : state.selectedProperty
                }));
            }
            return result;
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete property' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    archiveProperty: async (id) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${PROPERTIES_ENDPOINT}/${id}/archive`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to archive property');
            }

            return await response.json();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to archive property' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updatePropertyMetadata: async (id, metadata) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${PROPERTIES_ENDPOINT}/${id}/metadata`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metadata)
            });

            if (!response.ok) {
                throw new Error('Failed to update property metadata');
            }

            const updatedProperty = convertToProperty(await response.json());
            set(state => ({
                properties: state.properties.map(p => 
                    p.property_id === id ? updatedProperty : p
                ),
                selectedProperty: state.selectedProperty?.property_id === id ? 
                    updatedProperty : state.selectedProperty
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update property metadata' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    getPropertyLocation: async (id) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${PROPERTIES_ENDPOINT}/${id}/location`);
            
            if (!response.ok) {
                throw new Error('Failed to get property location');
            }

            return await response.json();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to get property location' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    getPropertyAddresses: async (id) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${PROPERTIES_ENDPOINT}/${id}/addresses`);
            
            if (!response.ok) {
                throw new Error('Failed to get property addresses');
            }

            return await response.json();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to get property addresses' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    getPropertyAccounts: async (propertyId) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${PROPERTIES_ENDPOINT}/${propertyId}/accounts`);
            
            if (!response.ok) {
                throw new Error('Failed to get property accounts');
            }

            return await response.json();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to get property accounts' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    }
}));
