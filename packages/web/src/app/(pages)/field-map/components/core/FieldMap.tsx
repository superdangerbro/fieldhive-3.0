'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useTheme, Box } from '@mui/material';
import { MapRef, Marker } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import { useFieldMap } from '../../../../../app/globalHooks/useFieldMap';
import { useMapContext } from '../../../../../app/globalHooks/useMapContext';
import { useMapMovement } from '../../../../../app/globalHooks/useMapMovement';
import { usePropertyQueries } from '../../../../../app/globalHooks/usePropertyQueries';
import { BaseMap, MapControls } from '.';
import { PropertyLayer, PropertyBoundaryLayer } from '../properties';
import { PropertyDetailsDialog } from '../properties/PropertyDetailsDialog';
import { EquipmentLayer, EquipmentLayerHandle } from '../equipment';
import { SelectJobDialog } from '../equipment/SelectJobDialog';
import { FloorPlanLayer, ModeSelector, LayersControl, ActiveJobIndicator } from '../overlays';
import { ENV_CONFIG } from '../../../../../app/config/environment';
import type { MapProperty } from '../../types';
import type { Job } from '../../../../../app/globalTypes/job';
import type { Filters } from '../overlays/types';
import type { PropertyWithLocation } from '../../../../../app/globalTypes/property';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const ZOOM_LEVEL = 19;
const ANIMATION_DURATION = 1500;
const MAP_PITCH = 45;
const isDev = process.env.NODE_ENV === 'development';

export function FieldMap() {
  const theme = useTheme();
  const {
    activeJob,
    activeProperty,
    activeMode,
    showFieldEquipment,
    setActiveJob,
    setActiveProperty,
    setShowFieldEquipment,
    clearContext
  } = useMapContext();

  const [selectedPropertyId, setSelectedPropertyId] = React.useState<string | null>(null);
  const [mapBounds, setMapBounds] = React.useState<[number, number, number, number] | null>(null);
  const [showSelectJobDialog, setShowSelectJobDialog] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const equipmentLayerRef = useRef<EquipmentLayerHandle>(null);
  const [filters, setFilters] = React.useState<Filters>({
    statuses: ['active'],
    types: []
  });

  const { 
    selectedProperty,
    setSelectedProperty,
    setCurrentBounds: debouncedSetBounds,
  } = useFieldMap();

  // Use optimized map movement hook
  const { viewState, handleViewStateChange, handleMoveEnd } = useMapMovement({
    onBoundsChange: (bounds) => {
      setMapBounds(bounds);
      if (!bounds.some(isNaN)) {
        debouncedSetBounds(bounds);
      }
    }
  });

  // Use optimized property queries
  const {
    propertiesWithinBounds,
    propertyOptions,
    isLoading: isLoadingProperties
  } = usePropertyQueries({
    bounds: mapBounds,
    filters,
    enabled: !!mapBounds
  });

  const mapRef = useRef<MapRef>(null);
  const [isTracking, setIsTracking] = React.useState(false);
  const [userLocation, setUserLocation] = React.useState<[number, number] | undefined>();

  useEffect(() => {
    if (!selectedPropertyId) {
      clearContext();
    }
  }, [clearContext, selectedPropertyId]);

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

  const handleLocationUpdate = useCallback((coords: [number, number]) => {
    setUserLocation(coords);
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
  }, [setShowFieldEquipment]);

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
    
    setActiveJob(job);
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
    } catch (error) {
      console.error('Error setting up job:', error);
      setActiveJob(null);
      setShowFieldEquipment(false);
      setSelectedProperty(null);
    }
  }, [setActiveJob, setSelectedProperty, setShowFieldEquipment, focusOnLocation]);

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
        viewState={viewState}
        onMove={handleViewStateChange}
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
            bounds={mapBounds || undefined}
          />
        )}
        <FloorPlanLayer
          mapRef={mapRef}
          selectedPropertyId={selectedProperty?.id}
        />
      </BaseMap>

      <LayersControl
        propertyFilters={filters}
        onPropertyFiltersChange={handlePropertyFiltersChange}
      />

      <ModeSelector
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
