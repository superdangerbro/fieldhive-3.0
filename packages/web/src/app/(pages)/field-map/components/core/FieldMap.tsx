'use client';

import React, { useState, useCallback, useEffect, useRef, ChangeEvent } from 'react';
import { useTheme, Box } from '@mui/material';
import { MapRef, Marker, ViewState } from 'react-map-gl';
import { useQuery } from '@tanstack/react-query';
import { useFieldMap } from '../../../../../app/globalHooks/useFieldMap';
import { useActiveJobContext } from '../../../../../app/globalHooks/useActiveJobContext';
import { BaseMap, MapControls } from '.';
import { PropertyLayer, PropertyBoundaryLayer } from '../properties';
import { PropertyDetailsDialog } from '../properties/PropertyDetailsDialog';
import { EquipmentLayer, EquipmentLayerHandle } from '../equipment';
import { SelectJobDialog } from '../equipment/SelectJobDialog';
import { FloorPlanLayer, ModeSelector, LayersControl, ActiveJobIndicator } from '../overlays';
import { ENV_CONFIG } from '../../../../../app/config/environment';
import type { MapProperty } from '../../types';
import type { Mode } from '../overlays/ModeSelector';
import type { Job } from '../../../../../app/globalTypes/job';
import type { Property } from '../../../../../app/globalTypes/property';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface PropertyWithLocation {
  property_id: string;
  name: string;
  type: string;
  status: string;
  service_address_id: string | null;
  billing_address_id: string | null;
  created_at: Date;
  updated_at: Date;
  location: {
    coordinates: [number, number];
  };
}

const ZOOM_LEVEL = 19;
const ANIMATION_DURATION = 1500;
const MAP_PITCH = 45;

export function FieldMap() {
  const theme = useTheme();
  const { activeJob, activeProperty } = useActiveJobContext();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<[number, number, number, number] | null>(null);
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -95,
    latitude: 37,
    zoom: 3.5,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  const { 
    selectedProperty,
    setSelectedProperty,
    currentBounds,
    setCurrentBounds: debouncedSetBounds,
    properties,
    isLoading,
    filters,
    setFilters
  } = useFieldMap();

  const mapRef = useRef<MapRef>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>();
  const [showFieldEquipment, setShowFieldEquipment] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);
  const [showSelectJobDialog, setShowSelectJobDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentMode, setCurrentMode] = useState<Mode>(null);
  const equipmentLayerRef = useRef<EquipmentLayerHandle>(null);

  // Query for properties within bounds
  const { data: propertiesWithinBounds = [] } = useQuery<PropertyWithLocation[]>({
    queryKey: ['properties', mapBounds],
    queryFn: async () => {
      if (!mapBounds) return [];
      try {
        const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties?bounds=${mapBounds.join(',')}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to fetch properties');
        }
        const data = await response.json();
        return data.properties || [];
      } catch (error) {
        console.error('Error fetching properties:', error);
        return [];
      }
    },
    enabled: !!mapBounds,
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Utility functions first
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

  const handleClosePropertyDetails = useCallback(() => {
    setSelectedProperty(null);
  }, [setSelectedProperty]);

  const handleMoveEnd = useCallback((bounds: [number, number, number, number]) => {
    setMapBounds(bounds);
    if (bounds.some(isNaN)) return;
    console.log('Map bounds updated:', bounds);
    debouncedSetBounds(bounds);
  }, [debouncedSetBounds]);

  const handleLocationUpdate = useCallback((coords: [number, number]) => {
    console.log('Location update received in FieldMap:', coords);
    setUserLocation(coords);
  }, []);

  const handleToggleFieldEquipment = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    console.log('Equipment visibility toggled:', event.target.checked);
    setShowFieldEquipment(event.target.checked);
  }, []);

  const handlePropertyFiltersChange = useCallback((newFilters: typeof filters) => {
    const sanitizedFilters = {
      statuses: newFilters.statuses || [],
      types: newFilters.types || []
    };
    console.log('Property filters updated:', sanitizedFilters);
    setFilters(sanitizedFilters);
  }, [setFilters]);

  const handleStyleChange = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const newMode = !isDarkMode;
    console.log('Map style changing to:', newMode ? 'dark' : 'light');
    
    map.setStyle(`mapbox://styles/mapbox/${newMode ? 'dark' : 'light'}-v10`);
    setIsDarkMode(newMode);
  }, [isDarkMode]);

  const handleZoomIn = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.zoomOut();
  }, []);

  const handlePropertyClick = useCallback((property: MapProperty) => {
    setSelectedPropertyId(property.property_id);
    setSelectedProperty({
      id: property.property_id,
      name: property.name,
      location: {
        longitude: property.location.coordinates[0],
        latitude: property.location.coordinates[1]
      }
    });
  }, [setSelectedProperty]);

  const handleWorkOnJob = useCallback((job: Job) => {
    setShowFieldEquipment(true);
    setShowSelectJobDialog(false);
    if (equipmentLayerRef.current?.handleStartPlacement) {
      equipmentLayerRef.current.handleStartPlacement();
    }
  }, []);

  const handlePropertyBoundaryClick = useCallback(async (propertyId: string, coordinates: [number, number]) => {
    if (!propertyId || !coordinates) return;
    
    console.log('Property boundary clicked:', propertyId, 'at coordinates:', coordinates);

    try {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/${propertyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property details');
      }
      const propertyData = await response.json();

      if (!propertyData) {
        throw new Error('No property data received');
      }

      const selectedProp = {
        id: propertyId,
        name: propertyData.name || `Property ${propertyId}`,
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
        name: `Property ${propertyId}`,
        location: {
          longitude: coordinates[0],
          latitude: coordinates[1]
        }
      };

      focusOnLocation(coordinates[0], coordinates[1]);
      setSelectedProperty(selectedProp);
    }
  }, [setSelectedProperty, focusOnLocation]);

  const handleJobSelect = useCallback((job: Job) => {
    if (!job) return;
    
    console.log('Job selected:', job);
    setSelectedJobId(job.job_id);
    setShowSelectJobDialog(false);
    
    try {
      if (job.property && job.property.location) {
        setSelectedProperty({
          id: job.property.property_id,
          name: job.property.name || 'Unnamed Property',
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
      
      setCurrentMode('edit');
    } catch (error) {
      console.error('Error setting up job:', error);
      setSelectedJobId(undefined);
    }
  }, [setSelectedProperty, focusOnLocation, setCurrentMode]);

  const handleModeChange = useCallback((mode: Mode) => {
    console.log('Mode changed:', mode);
    
    if (mode === 'edit') {
      if (!activeJob) {
        setShowSelectJobDialog(true);
        return;
      }
    } else {
      setSelectedJobId(undefined);
    }
    
    setCurrentMode(mode);
  }, [activeJob]);

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

  useEffect(() => {
    console.log('Current user location:', userLocation);
  }, [userLocation]);

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <BaseMap
        ref={mapRef}
        {...viewState}
        onMoveEnd={handleMoveEnd}
        onTrackingStart={() => setIsTracking(true)}
        onTrackingEnd={() => setIsTracking(false)}
        onLocationUpdate={handleLocationUpdate}
      >
        <PropertyLayer
          onPropertyClick={handlePropertyClick}
        />
        {mapBounds && (
          <PropertyBoundaryLayer
            bounds={mapBounds}
            filters={filters}
            onPropertyClick={handlePropertyBoundaryClick}
            activePropertyId={activeProperty?.property_id}
            highlightColor={theme.palette.primary.main}
          />
        )}
        {propertiesWithinBounds?.filter(property => 
          property?.location?.coordinates && 
          Array.isArray(property.location.coordinates) && 
          property.location.coordinates.length === 2
        ).map((property: PropertyWithLocation) => (
          <Marker
            key={property.property_id}
            longitude={property.location.coordinates[0]}
            latitude={property.location.coordinates[1]}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
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
                  coordinates: property.location.coordinates
                }
              };
              handlePropertyClick(mapProperty);
            }}
          >
            <Box
              sx={{
                cursor: 'pointer',
                color: activeProperty?.property_id === property.property_id
                  ? theme.palette.primary.main
                  : theme.palette.text.primary
              }}
            >
              <LocationOnIcon />
            </Box>
          </Marker>
        ))}
        {showFieldEquipment && (
          <EquipmentLayer
            ref={equipmentLayerRef}
            visible={showFieldEquipment}
            selectedJobId={selectedJobId}
            selectedPropertyId={selectedProperty?.id}
            bounds={mapBounds || undefined}
            isAddMode={currentMode === 'edit'}
          />
        )}
        <FloorPlanLayer
          mapRef={mapRef}
          selectedPropertyId={selectedProperty?.id}
        />
      </BaseMap>

      {/* Map Controls */}
      <LayersControl
        showFieldEquipment={showFieldEquipment}
        onToggleFieldEquipment={handleToggleFieldEquipment}
        propertyFilters={filters}
        onPropertyFiltersChange={handlePropertyFiltersChange}
      />

      {/* Mode Selector */}
      <ModeSelector
        onModeChange={handleModeChange}
        onAddEquipment={handleAddEquipment}
      />

      {/* Map Controls */}
      <MapControls
        onStyleChange={handleStyleChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isTracking={isTracking}
      />

      {selectedPropertyId && (
        <PropertyDetailsDialog
          propertyId={selectedPropertyId}
          onClose={handleClosePropertyDetails}
          onWorkOnJob={handleWorkOnJob}
        />
      )}

      {showSelectJobDialog && (
        <SelectJobDialog
          open={showSelectJobDialog}
          onClose={() => setShowSelectJobDialog(false)}
          onJobSelect={handleJobSelect}
        />
      )}

      {/* Active Job Indicator */}
      <ActiveJobIndicator />
    </Box>
  );
}
