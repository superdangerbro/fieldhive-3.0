import { useState, useEffect } from 'react';
import type { Property } from '@fieldhive/shared';

export function usePersistedProperty() {
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    // Load property from localStorage on mount
    const savedProperty = localStorage.getItem('selectedProperty');
    if (savedProperty) {
      try {
        setProperty(JSON.parse(savedProperty));
      } catch (error) {
        console.error('Failed to parse saved property:', error);
        localStorage.removeItem('selectedProperty');
      }
    }
  }, []);

  const persistProperty = (newProperty: Property | null) => {
    if (newProperty) {
      localStorage.setItem('selectedProperty', JSON.stringify(newProperty));
    } else {
      localStorage.removeItem('selectedProperty');
    }
    setProperty(newProperty);
  };

  return [property, persistProperty] as const;
}
