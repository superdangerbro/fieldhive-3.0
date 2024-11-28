'use client';

import React, { useCallback, useEffect } from 'react';
import { Marker } from 'react-map-gl';
import { Box, Tooltip, useTheme } from '@mui/material';
import { useFieldMap } from '../../../../../app/globalHooks/useFieldMap';
import { useActiveJobContext } from '../../../../../app/globalHooks/useActiveJobContext';
import { PropertyMarker } from '../markers/PropertyMarker';
import type { MapProperty } from '../../types';

interface PropertyLayerProps {
  /** Callback when a property is clicked */
  onPropertyClick?: (property: MapProperty) => void;
}

interface PropertyResponse {
  property_id: string;
  name: string;
  type: string;
  status: string;
  service_address_id: string | null;
  billing_address_id: string | null;
  created_at: Date;
  updated_at: Date;
  location: {
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    properties: {
      property_id: string;
    };
  } | null;
  boundary: {
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: [number, number][][];
    };
    properties: {
      property_id: string;
    };
  } | null;
}

/**
 * PropertyLayer handles rendering and interaction of property markers on the map.
 * Features:
 * - Renders property markers for all properties in view
 * - Handles property selection
 * - Shows selected property marker with animation
 * - Manages property marker visibility and styling
 */
export function PropertyLayer({
  onPropertyClick
}: PropertyLayerProps) {
  const theme = useTheme();
  const { 
    properties,
    selectedProperty,
    setSelectedProperty,
    mapRef,
    filters
  } = useFieldMap();

  const { activeJob } = useActiveJobContext();

  // Debug property updates
  useEffect(() => {
    console.log('Properties in PropertyLayer:', {
      total: properties.length,
      withLocation: properties.filter((p: PropertyResponse) => p.location?.geometry?.coordinates).length,
      firstProperty: properties[0],
      filters
    });
  }, [properties, filters]);

  /**
   * Handle property marker click
   * Updates selected property and triggers animation
   */
  const handlePropertyClick = useCallback((property: MapProperty) => {
    if (!property.location?.coordinates) return;

    console.log('Property clicked:', property.property_id);
    
    const propertyData = {
      id: property.property_id,
      name: property.name,
      location: {
        latitude: property.location.coordinates[1],
        longitude: property.location.coordinates[0]
      }
    };

    // Update selected property
    setSelectedProperty(propertyData);

    // Fly to property location using mapRef
    if (mapRef.current) {
      mapRef.current.easeTo({
        center: [propertyData.location.longitude, propertyData.location.latitude],
        zoom: 18,
        duration: 1500
      });
    }
    
    // Notify parent component
    onPropertyClick?.(property);
  }, [setSelectedProperty, mapRef, onPropertyClick]);

  return (
    <>
      {/* Regular property markers */}
      {properties.map((property: PropertyResponse) => {
        if (!property.location?.geometry?.coordinates) {
          console.log('Skipping property without location:', property.property_id);
          return null;
        }

        // Convert property to MapProperty format
        const mapProperty: MapProperty = {
          property_id: property.property_id,
          name: property.name,
          type: property.type,
          status: property.status,
          service_address_id: property.service_address_id,
          billing_address_id: property.billing_address_id,
          created_at: property.created_at,
          updated_at: property.updated_at,
          location: {
            type: 'Point',
            coordinates: property.location.geometry.coordinates
          }
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
      {selectedProperty?.location && (
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
                bgcolor: '#4CAF50', // Green color
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
