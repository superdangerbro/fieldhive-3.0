'use client';

import { useState, useEffect } from 'react';
import { Property } from '@/app/globaltypes';
import { usePropertyStore } from '../store';

export function usePersistedProperty() {
    const { properties, fetchProperties } = usePropertyStore();
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPersistedProperty = async () => {
            const savedPropertyId = localStorage.getItem('selectedProperty');
            if (savedPropertyId) {
                try {
                    await fetchProperties();
                    const property = properties.find(p => p.property_id === savedPropertyId);
                    if (property) {
                        setSelectedProperty(property);
                    }
                } catch (error) {
                    console.error('Failed to load persisted property:', error);
                }
            }
            setIsLoading(false);
        };

        loadPersistedProperty();
    }, [fetchProperties, properties]);

    const persistProperty = (property: Property | null) => {
        if (property) {
            localStorage.setItem('selectedProperty', property.property_id);
        } else {
            localStorage.removeItem('selectedProperty');
        }
        setSelectedProperty(property);
    };

    return {
        selectedProperty,
        setSelectedProperty: persistProperty,
        isLoading
    };
}
