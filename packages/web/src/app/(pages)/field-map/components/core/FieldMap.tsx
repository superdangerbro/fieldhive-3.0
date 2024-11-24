'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTheme, Box } from '@mui/material';
import { MapRef } from 'react-map-gl';
import { useQuery } from '@tanstack/react-query';
import { useFieldMap } from '../../../../../app/globalHooks/useFieldMap';
import { BaseMap, MapControls } from '.';
import { PropertyLayer, PropertyBoundaryLayer } from '../properties';
import { PropertyDetailsDialog } from '../properties/PropertyDetailsDialog';
import { EquipmentLayer } from '../equipment';
import { SelectJobDialog } from '../equipment/SelectJobDialog';
import { FloorPlanLayer, ModeSelector, LayersControl } from '../overlays';
import { JobsLayer } from '../jobs/JobsLayer';
import { ENV_CONFIG } from '../../../../../app/config/environment';
import type { MapProperty } from '../../types';
import type { Mode } from '../overlays/ModeSelector';

interface Filters {
  statuses: string[];
  types: string[];
}

interface JobWithLocation {
  job_id: string;
  name: string;
  property: {
    property_id: string;
    name: string;
    location: {
      coordinates: [number, number];
    };
  };
}

export function FieldMap() {
  const theme = useTheme();
  const mapRef = useRef<MapRef>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>();
  const [showFieldEquipment, setShowFieldEquipment] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);
  const [showSelectJobDialog, setShowSelectJobDialog] = useState(false);
  const [jobFilters, setJobFilters] = useState<Filters>({
    statuses: [],
    types: []
  });
  const [propertyFilters, setPropertyFilters] = useState<Filters>({
    statuses: [],
    types: []
  });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentMode, setCurrentMode] = useState<Mode>(null);
  const equipmentLayerRef = useRef<any>(null);

  const { 
    selectedProperty,
    setSelectedProperty,
    currentBounds,
    setCurrentBounds,
    properties,
    isLoading
  } = useFieldMap();

  const handleMoveEnd = useCallback(async (bounds: [number, number, number, number]) => {
    console.log('Map bounds updated:', bounds);
    setCurrentBounds(bounds);
  }, [setCurrentBounds]);

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

    // Get map instance
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Zoom to property
    map.easeTo({
      center: [selectedProp.location.longitude, selectedProp.location.latitude],
      zoom: 18,
      duration: 1500
    });

    setSelectedProperty(selectedProp);
  }, [setSelectedProperty]);

  const handlePropertyBoundaryClick = useCallback(async (propertyId: string, coordinates: [number, number]) => {
    console.log('Property boundary clicked:', propertyId, 'at coordinates:', coordinates);

    try {
      // Fetch property details to get the name
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

      // Get map instance
      const map = mapRef.current?.getMap();
      if (!map) return;

      // Zoom to property
      map.easeTo({
        center: [coordinates[0], coordinates[1]],
        zoom: 18,
        duration: 1500
      });
      
      setSelectedProperty(selectedProp);
    } catch (error) {
      console.error('Error fetching property details:', error);
      // Still select the property even if we can't get the name
      const selectedProp = {
        id: propertyId,
        name: 'Property ' + propertyId,
        location: {
          longitude: coordinates[0],
          latitude: coordinates[1]
        }
      };

      // Get map instance
      const map = mapRef.current?.getMap();
      if (!map) return;

      // Zoom to property
      map.easeTo({
        center: [coordinates[0], coordinates[1]],
        zoom: 18,
        duration: 1500
      });

      setSelectedProperty(selectedProp);
    }
  }, [setSelectedProperty]);

  const handleToggleFieldEquipment = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Equipment visibility toggled:', event.target.checked);
    setShowFieldEquipment(event.target.checked);
  }, []);

  const handleJobFiltersChange = useCallback((filters: Filters) => {
    console.log('Job filters updated:', filters);
    setJobFilters(filters);
  }, []);

  const handlePropertyFiltersChange = useCallback((filters: Filters) => {
    console.log('Property filters updated:', filters);
    setPropertyFilters(filters);
  }, []);

  const handleModeChange = useCallback((mode: Mode) => {
    console.log('Mode changed:', mode);
    setCurrentMode(mode);
    // Reset job selection when exiting edit mode
    if (mode !== 'edit') {
      setSelectedJobId(undefined);
    }
  }, []);

  const handleJobSelect = useCallback((jobOrId: JobWithLocation | string) => {
    // If we received a job ID (from JobsLayer), fetch the job details
    if (typeof jobOrId === 'string') {
      setSelectedJobId(jobOrId);
      return;
    }

    // If we received a full job object (from SelectJobDialog)
    const job = jobOrId;
    console.log('Job selected:', job);
    setSelectedJobId(job.job_id);
    setSelectedProperty({
      id: job.property.property_id,
      name: job.property.name,
      location: {
        latitude: job.property.location.coordinates[1],
        longitude: job.property.location.coordinates[0]
      }
    });

    // Zoom to property
    const map = mapRef.current?.getMap();
    if (map) {
      map.easeTo({
        center: [
          job.property.location.coordinates[0],
          job.property.location.coordinates[1]
        ],
        zoom: 18,
        duration: 1500
      });
    }
  }, [setSelectedProperty]);

  const handleAddEquipment = useCallback(() => {
    console.log('Add equipment clicked');
    if (!selectedProperty || !selectedJobId) {
      setShowSelectJobDialog(true);
      return;
    }
    if (equipmentLayerRef.current?.handleStartPlacement) {
      equipmentLayerRef.current.handleStartPlacement();
    }
  }, [selectedProperty, selectedJobId]);

  const handleLocationUpdate = useCallback((coords: [number, number]) => {
    console.log('Location update received in FieldMap:', coords);
    setUserLocation(coords);
  }, []);

  useEffect(() => {
    console.log('Current user location:', userLocation);
  }, [userLocation]);

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

  const handleClosePropertyDetails = useCallback(() => {
    setSelectedProperty(null);
  }, [setSelectedProperty]);

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
        onLocationUpdate={handleLocationUpdate}
      >
        <LayersControl
          showFieldEquipment={showFieldEquipment}
          onToggleFieldEquipment={handleToggleFieldEquipment}
          jobFilters={jobFilters}
          onJobFiltersChange={handleJobFiltersChange}
          propertyFilters={propertyFilters}
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

        {/* Regular property markers */}
        <PropertyLayer
          onPropertyClick={handlePropertyClick}
        />

        {/* Property boundaries */}
        {currentBounds && (
          <PropertyBoundaryLayer
            bounds={currentBounds}
            filters={propertyFilters}
            onPropertyClick={handlePropertyBoundaryClick}
          />
        )}

        <EquipmentLayer
          ref={equipmentLayerRef}
          visible={showFieldEquipment}
          selectedPropertyId={selectedProperty?.id}
          selectedJobId={selectedJobId}
          bounds={currentBounds || undefined}
          isAddMode={currentMode === 'edit'}
        />

        {/* Filtered jobs */}
        {currentBounds && jobFilters.statuses.length > 0 && (
          <JobsLayer 
            bounds={currentBounds}
            filters={jobFilters}
            selectedJobId={selectedJobId}
            onJobSelect={handleJobSelect}
          />
        )}

        <FloorPlanLayer
          mapRef={mapRef}
          selectedPropertyId={selectedProperty?.id}
        />
      </BaseMap>

      {/* Property Details Dialog */}
      <PropertyDetailsDialog
        propertyId={selectedProperty?.id || null}
        onClose={handleClosePropertyDetails}
      />

      {/* Select Job Dialog */}
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
            }, 1500); // Wait for zoom animation
          }
        }}
        userLocation={userLocation}
      />
    </Box>
  );
}
