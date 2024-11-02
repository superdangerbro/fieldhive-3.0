'use client';

import React, { useCallback, useEffect } from 'react';
import { Marker } from 'react-map-gl';
import { Box, Tooltip, useTheme } from '@mui/material';
import { useFieldMapStore } from '../../stores/fieldMapStore';
import { PropertyMarker } from '../markers/PropertyMarker';
import { toPointLocation } from '../../utils/location';
import type { MapProperty } from '../../types';

interface PropertyLayerProps {
  /** Whether to show the selected property marker */
  showSelectedMarker?: boolean;
  /** Callback when a property is clicked */
  onPropertyClick?: (property: MapProperty) => void;
}

/**
 * PropertyLayer handles rendering and interaction of property markers on the map.
 * Features:
 * - Renders property markers for all properties in view
 * - Handles property selection
 * - Shows selected property marker with animation
 * - Manages property marker visibility and styling
 * 
 * @component
 * @example
 * ```tsx
 * <PropertyLayer
 *   showSelectedMarker={true}
 *   onPropertyClick={(property) => console.log('Property clicked:', property)}
 * />
 * ```
 */
export function PropertyLayer({
  showSelectedMarker = true,
  onPropertyClick
}: PropertyLayerProps) {
  const theme = useTheme();
  const { 
    properties,
    selectedProperty,
    flyToProperty
  } = useFieldMapStore();

  // Debug property updates
  useEffect(() => {
    console.log('Properties in PropertyLayer:', properties.length);
    console.log('Selected property:', selectedProperty?.id);
  }, [properties, selectedProperty]);

  /**
   * Handle property marker click
   * Updates selected property and triggers animation
   */
  const handlePropertyClick = useCallback((property: MapProperty) => {
    console.log('Property clicked:', property.property_id);
    
    const propertyData = {
      id: property.property_id,
      name: property.name,
      location: {
        latitude: property.location.coordinates[1],
        longitude: property.location.coordinates[0]
      }
    };

    // Fly to property location
    flyToProperty(propertyData);
    
    // Notify parent component
    onPropertyClick?.(property);
  }, [flyToProperty, onPropertyClick]);

  return (
    <>
      {/* Regular property markers */}
      {properties.map((property) => {
        // Convert property to MapProperty if needed
        const mapProperty: MapProperty = {
          ...property,
          location: 'coordinates' in property.location
            ? property.location
            : toPointLocation(property.location as any)
        };

        return (
          <PropertyMarker
            key={mapProperty.property_id}
            property={mapProperty}
            onClick={handlePropertyClick}
          />
        );
      })}

      {/* Selected property highlight marker */}
      {selectedProperty && showSelectedMarker && (
        <Marker
          longitude={selectedProperty.location.longitude}
          latitude={selectedProperty.location.latitude}
        >
          <Tooltip title={selectedProperty.name} arrow placement="top">
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                border: '3px solid white',
                boxShadow: theme.shadows[3],
                transition: 'all 0.3s ease-in-out',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                  '50%': {
                    transform: 'scale(1.2)',
                    opacity: 0.8,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              }}
            />
          </Tooltip>
        </Marker>
      )}
    </>
  );
}
