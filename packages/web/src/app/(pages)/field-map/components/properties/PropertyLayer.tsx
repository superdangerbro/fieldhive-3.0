'use client';

import React, { useCallback, useEffect } from 'react';
import { Marker } from 'react-map-gl';
import { Box, Tooltip, useTheme } from '@mui/material';
import { useFieldMap } from '../../../../../app/globalHooks/useFieldMap';
import { PropertyMarker } from '../markers/PropertyMarker';
import type { MapProperty } from '../../types';

interface PropertyLayerProps {
  /** Whether to show the selected property marker */
  showSelectedMarker?: boolean;
  /** Callback when a property is clicked */
  onPropertyClick?: (property: MapProperty) => void;
}

interface Location {
  coordinates: [number, number];
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
  showSelectedMarker = true,
  onPropertyClick
}: PropertyLayerProps) {
  const theme = useTheme();
  const { 
    properties,
    selectedProperty,
    setSelectedProperty,
    mapRef
  } = useFieldMap();

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

  // Function to parse WKT string to coordinates
  const parseWKT = (wkt: string): Location | null => {
    try {
      // Remove any whitespace and convert to uppercase for consistent parsing
      const normalizedWkt = wkt.replace(/\s+/g, ' ').trim().toUpperCase();
      
      // Extract coordinates using a more flexible regex pattern
      const coordsMatch = normalizedWkt.match(/POINT\s*\(([^)]+)\)/);
      if (!coordsMatch) {
        console.warn('WKT string does not contain POINT data:', wkt);
        return null;
      }

      // Split coordinates and convert to numbers
      const coords = coordsMatch[1].trim().split(/\s+/);
      if (coords.length !== 2) {
        console.warn('Invalid number of coordinates in WKT string:', wkt);
        return null;
      }

      const longitude = parseFloat(coords[0]);
      const latitude = parseFloat(coords[1]);

      // Validate coordinates
      if (isNaN(longitude) || isNaN(latitude)) {
        console.warn('Invalid coordinate values in WKT string:', wkt);
        return null;
      }

      return { coordinates: [longitude, latitude] };
    } catch (error) {
      console.warn('Error parsing WKT string:', wkt, error);
      return null;
    }
  };

  // Function to get location coordinates regardless of format
  const getLocationCoordinates = (location: any): Location | null => {
    if (!location) return null;

    // If location is already in the correct format
    if (location.coordinates) {
      return location as Location;
    }

    // If location is a WKT string
    if (typeof location === 'string') {
      const parsedLocation = parseWKT(location);
      if (!parsedLocation) {
        console.warn('Failed to parse location WKT:', location);
        return null;
      }
      return parsedLocation;
    }

    // If location is in a different format, log and return null
    console.warn('Unsupported location format:', location);
    return null;
  };

  return (
    <>
      {/* Regular property markers */}
      {properties.map((property: any) => {
        if (!property.location) return null;

        const locationData = getLocationCoordinates(property.location);
        if (!locationData) return null;

        // Convert property to MapProperty
        const mapProperty: MapProperty = {
          ...property,
          location: locationData
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
      {selectedProperty?.location && showSelectedMarker && (
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
