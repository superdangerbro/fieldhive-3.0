'use client';

import React, { useState, useCallback, useEffect, useRef, ChangeEvent } from 'react';
import { useTheme, Box } from '@mui/material';
import { MapRef, Marker, ViewState } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
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

interface Filters {
  statuses: string[];
  types: string[];
}

const ZOOM_LEVEL = 19;
const ANIMATION_DURATION = 1500;
const MAP_PITCH = 45;

export function FieldMap() {
  const theme = useTheme();
  const { activeJob, activeProperty, setActiveProperty, clearContext } = useActiveJobContext();
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
  } = useFieldMap();

  const mapRef = useRef<MapRef>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | undefined>();
  const [showFieldEquipment, setShowFieldEquipment] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);
  const [showSelectJobDialog, setShowSelectJobDialog] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentMode, setCurrentMode] = useState<Mode>(null);
  const equipmentLayerRef = useRef<EquipmentLayerHandle>(null);
  const [filters, setFilters] = useState<Filters>({
    statuses: ['active'],
    types: []
  });

  const { data: propertyOptions } = useQuery({
    queryKey: ['propertyOptions'],
    queryFn: async () => {
      try {
        const response = await fetch(`${ENV_CONFIG.api.baseUrl}/api/properties/options`);
        if (!response.ok) {
          throw new Error('Failed to fetch property options');
        }
        const data = await response.json();
        
        // Ensure we have valid arrays
        const statuses = Array.isArray(data?.statuses) ? data.statuses : [];
        const types = Array.isArray(data?.types) ? data.types : [];
        
        // Make sure 'active' is in the list and normalize all values
        const normalizedStatuses = Array.from(new Set([
          'active',
          ...statuses.map(status => status?.toLowerCase() || '')
        ])).filter(Boolean).sort();
        
        const normalizedTypes = Array.from(new Set(
          types.map(type => type?.toLowerCase() || '')
        )).filter(Boolean).sort();

        return {
          statuses: normalizedStatuses,
          types: normalizedTypes
        };
      } catch (error) {
        console.error('Failed to fetch property options:', error);
        return { statuses: ['active'], types: [] };
      }
    },
    staleTime: 300000 // Cache for 5 minutes
  });

  // Clear context on mount if no property is selected
  useEffect(() => {
    if (!selectedPropertyId) {
      clearContext();
    }
  }, [clearContext, selectedPropertyId]);

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

  const handlePropertyFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
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

      // Set the property in the active job context
      setActiveProperty(propertyData);
      
      // Show the job selection dialog instead of property details
      setShowSelectJobDialog(true);
      
      // Get the property boundary and fit the map to it
      const map = mapRef.current?.getMap();
      if (map && propertyData.boundary?.geometry?.coordinates?.[0]) {
        try {
          // Calculate the bounds of the property boundary
          const bounds = new mapboxgl.LngLatBounds();
          const boundaryCoords = propertyData.boundary.geometry.coordinates[0];
          
          // Extend bounds with each coordinate
          boundaryCoords.forEach((coord: [number, number]) => {
            if (Array.isArray(coord) && coord.length === 2) {
              bounds.extend(coord);
            }
          });

          // Add some padding to the bounds
          const padding = { top: 50, bottom: 50, left: 50, right: 50 };
          
          // Fit the map to the property bounds
          map.fitBounds(bounds, {
            padding,
            duration: ANIMATION_DURATION,
            maxZoom: 19 // Prevent zooming in too far
          });
        } catch (error) {
          console.error('Error fitting to bounds:', error);
          // Fallback to simple centering if bounds calculation fails
          map.easeTo({
            center: coordinates,
            zoom: 17,
            duration: ANIMATION_DURATION
          });
        }
      } else {
        // Fallback if no boundary data
        map?.easeTo({
          center: coordinates,
          zoom: 17,
          duration: ANIMATION_DURATION
        });
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
    }
  }, [setActiveProperty]);

  const handleJobSelect = useCallback((job: Job) => {
    if (!job) return;
    
    console.log('Job selected:', job);
    setSelectedJobId(job.job_id);
    setShowSelectJobDialog(false);
    setShowFieldEquipment(true);
    
    try {
      if (job.property) {
        // Update the selected property
        setSelectedProperty({
          id: job.property.property_id,
          name: job.property.name || 'Unnamed Property',
          location: job.property.location ? {
            latitude: job.property.location.coordinates[1],
            longitude: job.property.location.coordinates[0]
          } : undefined
        });

        // Only focus on location if we have coordinates
        if (job.property.location?.coordinates) {
          focusOnLocation(
            job.property.location.coordinates[0],
            job.property.location.coordinates[1]
          );
        }
      }
      
      setCurrentMode('edit');
    } catch (error) {
      console.error('Error setting up job:', error);
      setSelectedJobId(undefined);
      setShowFieldEquipment(false);
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
        activePropertyId={activeProperty?.property_id}
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
