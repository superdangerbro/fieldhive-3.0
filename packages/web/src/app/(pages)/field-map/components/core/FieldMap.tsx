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
const isDev = process.env.NODE_ENV === 'development';

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
        
        const statuses = Array.isArray(data?.statuses) ? data.statuses : [];
        const types = Array.isArray(data?.types) ? data.types : [];
        
        const normalizedStatuses = Array.from(new Set([
          'active',
          ...statuses.map((status: string) => status?.toLowerCase() || '')
        ])).filter(Boolean).sort();
        
        const normalizedTypes = Array.from(new Set(
          types.map((type: string) => type?.toLowerCase() || '')
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
    staleTime: 300000
  });

  useEffect(() => {
    if (!selectedPropertyId) {
      clearContext();
    }
  }, [clearContext, selectedPropertyId]);

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
    debouncedSetBounds(bounds);
  }, [debouncedSetBounds]);

  const handleLocationUpdate = useCallback((coords: [number, number]) => {
    setUserLocation(coords);
  }, []);

  const handleToggleFieldEquipment = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setShowFieldEquipment(event.target.checked);
  }, []);

  const handlePropertyFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleStyleChange = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const newMode = !isDarkMode;    
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

    try {
      const response = await fetch(`${ENV_CONFIG.api.baseUrl}/properties/${propertyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property details');
      }
      const propertyData = await response.json();

      if (!propertyData) {
        throw new Error('No property data received');
      }

      setActiveProperty(propertyData);
      setShowSelectJobDialog(true);
      
      const map = mapRef.current?.getMap();
      if (map && propertyData.boundary?.geometry?.coordinates?.[0]) {
        try {
          const bounds = new mapboxgl.LngLatBounds();
          const boundaryCoords = propertyData.boundary.geometry.coordinates[0];
          
          boundaryCoords.forEach((coord: [number, number]) => {
            if (Array.isArray(coord) && coord.length === 2) {
              bounds.extend(coord);
            }
          });

          const padding = { top: 50, bottom: 50, left: 50, right: 50 };
          
          map.fitBounds(bounds, {
            padding,
            duration: ANIMATION_DURATION,
            maxZoom: 19
          });
        } catch (error) {
          console.error('Error fitting to bounds:', error);
          map.easeTo({
            center: coordinates,
            zoom: 17,
            duration: ANIMATION_DURATION
          });
        }
      } else {
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

  const handleJobSelect = useCallback((job: Job | null) => {
    if (!job) {
      if (isDev) console.warn('No job provided to handleJobSelect');
      return;
    }
    
    setSelectedJobId(job.job_id);
    setShowSelectJobDialog(false);
    setShowFieldEquipment(true);
    
    try {
      if (job.property && 
          typeof job.property === 'object' && 
          job.property.location?.coordinates && 
          Array.isArray(job.property.location.coordinates) && 
          job.property.location.coordinates.length === 2) {
        
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
      } else {
        if (isDev) console.warn('Selected job has no valid location data');
        setSelectedProperty(null);
      }
      
      setCurrentMode('edit');
    } catch (error) {
      console.error('Error setting up job:', error);
      setSelectedJobId(undefined);
      setShowFieldEquipment(false);
      setCurrentMode(null);
      setSelectedProperty(null);
    }
  }, [setSelectedProperty, focusOnLocation, setCurrentMode]);

  const handleModeChange = useCallback((mode: Mode) => {
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
    if (!activeJob) {
      setShowSelectJobDialog(true);
      return;
    }
    if (equipmentLayerRef.current?.handleStartPlacement) {
      equipmentLayerRef.current.handleStartPlacement();
    }
  }, [activeJob]);

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

      <LayersControl
        showFieldEquipment={showFieldEquipment}
        onToggleFieldEquipment={handleToggleFieldEquipment}
        propertyFilters={filters}
        onPropertyFiltersChange={handlePropertyFiltersChange}
        activePropertyId={activeProperty?.property_id}
      />

      <ModeSelector
        onModeChange={handleModeChange}
        onAddEquipment={handleAddEquipment}
      />

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

      <ActiveJobIndicator />
    </Box>
  );
}
