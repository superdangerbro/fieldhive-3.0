'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { FormControlLabel, Switch, useTheme } from '@mui/material';
import { MapRef } from 'react-map-gl';
import { useFieldMap } from '@/app/globalHooks/useFieldMap';
import { BaseMap, MapControls } from '.';
import { PropertyLayer } from '../properties';
import { EquipmentLayer } from '../equipment';
import { FloorPlanLayer } from '../overlays';
import type { MapProperty } from '../../types';

/**
 * FieldMap is the main map component that orchestrates all map-related functionality.
 * It manages the interaction between different layers and controls.
 * 
 * Features:
 * - Core map functionality (pan, zoom, style)
 * - Property management
 * - Equipment management
 * - Floor plan management
 * - Layer visibility controls
 * 
 * Architecture:
 * - Uses BaseMap for core map functionality
 * - Separate layers for properties, equipment, and floor plans
 * - Centralized state management via React Query
 * - Modular component structure for maintainability
 */
export function FieldMap() {
  const theme = useTheme();
  const mapRef = useRef<MapRef>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showFieldEquipment, setShowFieldEquipment] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Get state and actions from hooks
  const { 
    selectedProperty,
    setSelectedProperty,
    currentBounds,
    setCurrentBounds
  } = useFieldMap();

  // Debug component state
  useEffect(() => {
    console.log('FieldMap state:', {
      isTracking,
      showFieldEquipment,
      selectedProperty: selectedProperty?.id,
      isDarkMode,
      mapInstance: !!mapRef.current
    });
  }, [isTracking, showFieldEquipment, selectedProperty, isDarkMode]);

  /**
   * Handle map bounds changes
   * Updates both property and equipment data based on new bounds
   */
  const handleMoveEnd = useCallback(async (bounds: [number, number, number, number]) => {
    console.log('Map bounds updated:', bounds);
    setCurrentBounds(bounds);
  }, [setCurrentBounds]);

  /**
   * Handle property selection
   */
  const handlePropertyClick = useCallback((property: MapProperty) => {
    if (!property.location?.coordinates) return;

    console.log('Property selected:', property.property_id);
    setSelectedProperty({
      id: property.property_id,
      name: property.name,
      location: {
        latitude: property.location.coordinates[1],
        longitude: property.location.coordinates[0]
      }
    });
  }, [setSelectedProperty]);

  /**
   * Handle equipment visibility toggle
   */
  const handleToggleFieldEquipment = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Equipment visibility toggled:', event.target.checked);
    setShowFieldEquipment(event.target.checked);
  }, []);

  /**
   * Map control handlers
   */
  const handleStyleChange = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const newMode = !isDarkMode;
    console.log('Map style changing to:', newMode ? 'dark' : 'light');
    
    map.setStyle(`mapbox://styles/mapbox/${newMode ? 'dark' : 'light'}-v10`);
    setIsDarkMode(newMode);
  }, [isDarkMode]);

  const handleZoomIn = useCallback(() => {
    console.log('Zooming in');
    mapRef.current?.getMap()?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    console.log('Zooming out');
    mapRef.current?.getMap()?.zoomOut();
  }, []);

  return (
    <BaseMap
      ref={mapRef}
      onMoveEnd={handleMoveEnd}
      onTrackingStart={() => {
        console.log('Location tracking started');
        setIsTracking(true);
      }}
      onTrackingEnd={() => {
        console.log('Location tracking ended');
        setIsTracking(false);
      }}
    >
      {/* Layer visibility controls */}
      <FormControlLabel
        control={
          <Switch
            checked={showFieldEquipment}
            onChange={handleToggleFieldEquipment}
            name="showFieldEquipment"
          />
        }
        label="Show Field Equipment"
        sx={{
          position: 'absolute',
          top: 24,
          left: 16,
          backgroundColor: theme.palette.background.paper,
          padding: '4px 8px',
          borderRadius: 1,
          boxShadow: theme.shadows[2],
          zIndex: 1000,
        }}
      />

      {/* Map controls */}
      <MapControls
        isTracking={isTracking}
        onStyleChange={handleStyleChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Property markers and interactions */}
      <PropertyLayer
        onPropertyClick={handlePropertyClick}
      />

      {/* Equipment markers and interactions */}
      <EquipmentLayer
        visible={showFieldEquipment}
        selectedPropertyId={selectedProperty?.id}
        bounds={currentBounds || undefined}
      />

      {/* Floor plan overlay and controls */}
      <FloorPlanLayer
        mapRef={mapRef}
        selectedPropertyId={selectedProperty?.id}
      />
    </BaseMap>
  );
}
