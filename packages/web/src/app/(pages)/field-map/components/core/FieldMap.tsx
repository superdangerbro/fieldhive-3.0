'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTheme, Box } from '@mui/material';
import { MapRef } from 'react-map-gl';
import { useQuery } from '@tanstack/react-query';
import { useFieldMap } from '../../../../../app/globalHooks/useFieldMap';
import { useActiveJobContext } from '../../../../../app/globalHooks/useActiveJobContext';
import { BaseMap, MapControls } from '.';
import { PropertyLayer, PropertyBoundaryLayer } from '../properties';
import { PropertyDetailsDialog } from '../properties/PropertyDetailsDialog';
import { EquipmentLayer } from '../equipment';
import { SelectJobDialog } from '../equipment/SelectJobDialog';
import { FloorPlanLayer, ModeSelector, LayersControl, ActiveJobIndicator } from '../overlays';
import { ENV_CONFIG } from '../../../../../app/config/environment';
import type { MapProperty } from '../../types';
import type { Mode } from '../overlays/ModeSelector';
import type { Job } from '../../../../../app/globalTypes/job';

const ZOOM_LEVEL = 19;
const ANIMATION_DURATION = 1500;
const MAP_PITCH = 45;

export function FieldMap() {
  const theme = useTheme();
  const mapRef = useRef<MapRef>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>();
  const [showFieldEquipment, setShowFieldEquipment] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);
  const [showSelectJobDialog, setShowSelectJobDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentMode, setCurrentMode] = useState<Mode>(null);
  const equipmentLayerRef = useRef<any>(null);

  const { 
    selectedProperty,
    setSelectedProperty,
    currentBounds,
    setCurrentBounds,
    properties,
    isLoading,
    filters,
    setFilters
  } = useFieldMap();

  const { activeJob, activeProperty } = useActiveJobContext();

  const handleMoveEnd = useCallback(async (bounds: [number, number, number, number]) => {
    console.log('Map bounds updated:', bounds);
    setCurrentBounds(bounds);
  }, [setCurrentBounds]);

  const handleLocationUpdate = useCallback((coords: [number, number]) => {
    console.log('Location update received in FieldMap:', coords);
    setUserLocation(coords);
  }, []);

  const handleToggleFieldEquipment = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Equipment visibility toggled:', event.target.checked);
    setShowFieldEquipment(event.target.checked);
  }, []);

  const handlePropertyFiltersChange = useCallback((newFilters: typeof filters) => {
    console.log('Property filters updated:', newFilters);
    setFilters(newFilters);
  }, [setFilters]);

  const handleModeChange = useCallback((mode: Mode) => {
    console.log('Mode changed:', mode);
    setCurrentMode(mode);
    // Reset job selection when exiting edit mode
    if (mode !== 'edit') {
      setSelectedJobId(undefined);
    }
  }, []);

  const handleAddEquipment = useCallback(() => {
    console.log('Add equipment clicked');
    if (!activeJob) {
      setShowSelectJobDialog(true);
      return;
    }
    if (equipmentLayerRef.current?.handleStartPlacement) {
      equipmentLayerRef.current.handleStartPlacement();
    }
  }, [activeJob]);

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

  const focusOnLocation = useCallback((longitude: number, latitude: number) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.easeTo({
      center: [longitude, latitude],
      zoom: ZOOM_LEVEL,
      duration: ANIMATION_DURATION,
      pitch: MAP_PITCH
    });
  }, []);

  const handleJobSelect = useCallback((job: Job) => {
    console.log('Job selected:', job);
    setSelectedJobId(job.job_id);
    if (job.property && job.property.location) {
      setSelectedProperty({
        id: job.property.property_id,
        name: job.property.name,
        location: {
          latitude: job.property.location.coordinates[1],
          longitude: job.property.location.coordinates[0]
        }
      });

      focusOnLocation(
        job.property.location.coordinates[0],
        job.property.location.coordinates[1]
      );
    }
  }, [setSelectedProperty, focusOnLocation]);

  const handlePropertyClick = useCallback((property: MapProperty) => {
    if (!property.location?.coordinates) return;

    console.log('Property selected:', property.property_id);
    const selectedProp = {
      id: property.property_id,
      name: property.name,
      location: {
        latitude: property.location.coordinates[1],
        longitude: property.location.coordinates[0]
      }
    };

    focusOnLocation(
      property.location.coordinates[0],
      property.location.coordinates[1]
    );

    setSelectedProperty(selectedProp);
  }, [setSelectedProperty, focusOnLocation]);

  const handlePropertyBoundaryClick = useCallback(async (propertyId: string, coordinates: [number, number]) => {
    console.log('Property boundary clicked:', propertyId, 'at coordinates:', coordinates);

    try {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/${propertyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property details');
      }
      const propertyData = await response.json();

      const selectedProp = {
        id: propertyId,
        name: propertyData.name,
        location: {
          longitude: coordinates[0],
          latitude: coordinates[1]
        }
      };

      focusOnLocation(coordinates[0], coordinates[1]);
      setSelectedProperty(selectedProp);
    } catch (error) {
      console.error('Error fetching property details:', error);
      const selectedProp = {
        id: propertyId,
        name: 'Property ' + propertyId,
        location: {
          longitude: coordinates[0],
          latitude: coordinates[1]
        }
      };

      focusOnLocation(coordinates[0], coordinates[1]);
      setSelectedProperty(selectedProp);
    }
  }, [setSelectedProperty, focusOnLocation]);

  const handleClosePropertyDetails = useCallback(() => {
    setSelectedProperty(null);
  }, [setSelectedProperty]);

  useEffect(() => {
    console.log('Current user location:', userLocation);
  }, [userLocation]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '64px',
        left: '240px',
        right: 0,
        bottom: 0,
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <BaseMap
        ref={mapRef}
        onMoveEnd={handleMoveEnd}
        onTrackingStart={() => setIsTracking(true)}
        onTrackingEnd={() => setIsTracking(false)}
        onLocationUpdate={handleLocationUpdate}
      >
        <ActiveJobIndicator />

        <LayersControl
          showFieldEquipment={showFieldEquipment}
          onToggleFieldEquipment={handleToggleFieldEquipment}
          propertyFilters={filters}
          onPropertyFiltersChange={handlePropertyFiltersChange}
        />

        <MapControls
          isTracking={isTracking}
          onStyleChange={handleStyleChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />

        <ModeSelector 
          onModeChange={handleModeChange}
          onAddEquipment={handleAddEquipment}
        />

        <PropertyLayer
          onPropertyClick={handlePropertyClick}
        />

        {currentBounds && (
          <PropertyBoundaryLayer
            bounds={currentBounds}
            filters={filters}
            onPropertyClick={handlePropertyBoundaryClick}
            activePropertyId={activeProperty?.property_id}
            highlightColor={theme.palette.primary.main}
          />
        )}

        <EquipmentLayer
          ref={equipmentLayerRef}
          visible={showFieldEquipment}
          selectedPropertyId={selectedProperty?.id}
          selectedJobId={activeJob?.job_id}
          bounds={currentBounds || undefined}
          isAddMode={currentMode === 'edit'}
        />

        <FloorPlanLayer
          mapRef={mapRef}
          selectedPropertyId={selectedProperty?.id}
        />
      </BaseMap>

      <PropertyDetailsDialog
        propertyId={selectedProperty?.id || null}
        onClose={handleClosePropertyDetails}
      />

      <SelectJobDialog
        open={showSelectJobDialog}
        onClose={() => setShowSelectJobDialog(false)}
        onJobSelect={(job) => {
          console.log('Job selected in dialog:', job);
          handleJobSelect(job);
          setShowSelectJobDialog(false);
          if (equipmentLayerRef.current?.handleStartPlacement) {
            setTimeout(() => {
              equipmentLayerRef.current.handleStartPlacement();
            }, ANIMATION_DURATION);
          }
        }}
        userLocation={userLocation}
      />
    </Box>
  );
}
