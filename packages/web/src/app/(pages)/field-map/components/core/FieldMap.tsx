'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTheme, Box } from '@mui/material';
import { MapRef } from 'react-map-gl';
import { useFieldMap } from '../../../../../app/globalHooks/useFieldMap';
import { BaseMap, MapControls } from '.';
import { PropertyLayer } from '../properties';
import { EquipmentLayer } from '../equipment';
import { FloorPlanLayer, ModeSelector, LayersControl } from '../overlays';
import { JobsLayer } from '../jobs/JobsLayer';
import type { MapProperty } from '../../types';
import type { Mode } from '../overlays/ModeSelector';

interface JobFilters {
  statuses: string[];
  types: string[];
}

export function FieldMap() {
  const theme = useTheme();
  const mapRef = useRef<MapRef>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showFieldEquipment, setShowFieldEquipment] = useState(false);
  const [jobFilters, setJobFilters] = useState<JobFilters>({
    statuses: [],
    types: []
  });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentMode, setCurrentMode] = useState<Mode>(null);

  const { 
    selectedProperty,
    setSelectedProperty,
    currentBounds,
    setCurrentBounds
  } = useFieldMap();

  useEffect(() => {
    console.log('FieldMap state:', {
      isTracking,
      showFieldEquipment,
      jobFilters,
      selectedProperty: selectedProperty?.id,
      isDarkMode,
      mapInstance: !!mapRef.current,
      currentMode
    });
  }, [isTracking, showFieldEquipment, jobFilters, selectedProperty, isDarkMode, currentMode]);

  const handleMoveEnd = useCallback(async (bounds: [number, number, number, number]) => {
    console.log('Map bounds updated:', bounds);
    setCurrentBounds(bounds);
  }, [setCurrentBounds]);

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

  const handleToggleFieldEquipment = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Equipment visibility toggled:', event.target.checked);
    setShowFieldEquipment(event.target.checked);
  }, []);

  const handleJobFiltersChange = useCallback((filters: JobFilters) => {
    console.log('Job filters updated:', filters);
    setJobFilters(filters);
  }, []);

  const handleModeChange = useCallback((mode: Mode) => {
    console.log('Mode changed:', mode);
    setCurrentMode(mode);
  }, []);

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
    <Box
      sx={{
        position: 'fixed',
        top: '64px', // Header height
        left: '240px', // Sidebar width
        right: 0,
        bottom: 0,
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
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
        <LayersControl
          showFieldEquipment={showFieldEquipment}
          onToggleFieldEquipment={handleToggleFieldEquipment}
          jobFilters={jobFilters}
          onJobFiltersChange={handleJobFiltersChange}
        />

        <MapControls
          isTracking={isTracking}
          onStyleChange={handleStyleChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />

        <ModeSelector onModeChange={handleModeChange} />

        <PropertyLayer
          onPropertyClick={handlePropertyClick}
        />

        <EquipmentLayer
          visible={showFieldEquipment}
          selectedPropertyId={selectedProperty?.id}
          bounds={currentBounds || undefined}
        />

        {currentBounds && jobFilters.statuses.length > 0 && (
          <JobsLayer 
            bounds={currentBounds}
            filters={jobFilters}
          />
        )}

        <FloorPlanLayer
          mapRef={mapRef}
          selectedPropertyId={selectedProperty?.id}
        />
      </BaseMap>
    </Box>
  );
}
