'use client';

import React, { useCallback, useEffect, useRef, useMemo } from 'react';
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
  const [isEditMode, setIsEditMode] = React.useState(false);

  const { 
    selectedProperty,
    setSelectedProperty,
    setCurrentBounds: debouncedSetBounds,
  } = useFieldMap();

  // Use optimized map movement hook
  const { viewState, handleViewStateChange, handleMoveEnd } = useMapMovement({
    onBoundsChange: (bounds) => {
      // Only update bounds if they are valid
      if (bounds && !bounds.some(isNaN)) {
        setMapBounds(bounds);
        debouncedSetBounds(bounds);
      }
    },
    debounceMs: 300 // Reduced from 500ms for better responsiveness
  });

  // Memoize filters to prevent unnecessary rerenders
  const memoizedFilters = useMemo(() => ({
    statuses: filters.statuses,
    types: filters.types
  }), [filters.statuses, filters.types]);

  // Use optimized property queries
  const {
    propertiesWithinBounds,
    propertyOptions,
    isLoading: isLoadingProperties
  } = usePropertyQueries({
    bounds: mapBounds,
    filters: memoizedFilters,
    enabled: !!mapBounds && !mapBounds.some(isNaN)
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
    // Set the active job and enable field equipment layer
    setActiveJob(job);
    setShowFieldEquipment(true);
    setShowSelectJobDialog(false);

    // Start equipment placement if in edit mode
    if (equipmentLayerRef.current?.handleStartPlacement) {
      equipmentLayerRef.current.handleStartPlacement();
    }
  }, [setActiveJob, setShowFieldEquipment]);

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

      // Set the active property with location data
      setActiveProperty({
        ...propertyData,
        location: propertyData.location || {
          type: 'Point',
          coordinates: coordinates // Use clicked coordinates as fallback
        }
      });
      
      setShowSelectJobDialog(true);
      
      // Center the map on the property boundary
      const map = mapRef.current?.getMap();
      if (map && propertyData.boundary?.geometry?.coordinates?.[0]) {
        try {
          const bounds = new mapboxgl.LngLatBounds();
          const boundaryCoords = propertyData.boundary.geometry.coordinates[0];
          
          boundaryCoords.forEach((coord: [number, number]) => {
            if (Array.isArray(coord) && coord.length === 2 && 
                !isNaN(coord[0]) && !isNaN(coord[1])) {
              bounds.extend(coord);
            }
          });

          const padding = { top: 50, bottom: 50, left: 50, right: 50 };
          
          map.fitBounds(bounds, {
            padding,
            duration: ANIMATION_DURATION
          });
        } catch (error) {
          console.error('Error fitting bounds:', error);
          // Fallback to centering on clicked coordinates
          map.easeTo({
            center: coordinates,
            zoom: ZOOM_LEVEL,
            duration: ANIMATION_DURATION,
            pitch: MAP_PITCH
          });
        }
      } else {
        // If no valid boundary, center on clicked coordinates
        map?.easeTo({
          center: coordinates,
          zoom: ZOOM_LEVEL,
          duration: ANIMATION_DURATION,
          pitch: MAP_PITCH
        });
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
    }
  }, [setActiveProperty]);

  const handleJobSelect = useCallback((job: Job) => {
    try {
      if (job.property?.location?.coordinates) {
        // Set both active states
        setActiveJob(job);
        setActiveProperty(job.property);
        
        // Enable equipment layer
        setShowFieldEquipment(true);
        setShowSelectJobDialog(false);
        
        // Center the map on the property
        focusOnLocation(
          job.property.location.coordinates[0],
          job.property.location.coordinates[1]
        );
      } else {
        if (isDev) console.warn('Selected job has no valid location data');
      }
    } catch (error) {
      console.error('Error setting up job:', error);
      setActiveJob(null);
      setActiveProperty(null);
      setShowFieldEquipment(false);
    }
  }, [setActiveJob, setActiveProperty, setShowFieldEquipment, focusOnLocation, isDev]);

  const handleAddEquipment = useCallback(() => {
    console.log('Add Equipment clicked', {
      activeJob,
      equipmentLayerRef: equipmentLayerRef.current,
      showFieldEquipment
    });
    if (!activeJob) {
      setShowSelectJobDialog(true);
      return;
    }
    setShowFieldEquipment(true);
    if (equipmentLayerRef.current?.handleStartPlacement) {
      equipmentLayerRef.current.handleStartPlacement();
    }
  }, [activeJob, showFieldEquipment]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <BaseMap
        id="map"
        ref={mapRef}
        viewState={viewState}
        onMove={handleViewStateChange}
        onMoveEnd={handleMoveEnd}
        onTrackingStart={() => setIsTracking(true)}
        onTrackingEnd={() => setIsTracking(false)}
        onLocationUpdate={handleLocationUpdate}
      >
        <ActiveJobIndicator />
        
        {/* Property Layers */}
        <PropertyBoundaryLayer
          bounds={mapBounds}
          filters={filters}
          onPropertyClick={handlePropertyBoundaryClick}
          activePropertyId={activeProperty?.property_id}
          highlightColor={theme.palette.primary.main}
        />
        
        {/* Equipment Layer */}
        <EquipmentLayer 
          ref={equipmentLayerRef}
          visible={showFieldEquipment}
          bounds={mapBounds}
          mapRef={mapRef}
        />

        {/* User Location */}
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
      </BaseMap>

      {/* Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onStyleChange={handleStyleChange}
        onTrackingToggle={() => setIsTracking(!isTracking)}
        isTracking={isTracking}
      />

      <LayersControl
        propertyFilters={filters}
        onPropertyFiltersChange={handlePropertyFiltersChange}
      />

      <ModeSelector
        onAddEquipment={handleAddEquipment}
      />

      {/* Job Selection Dialog */}
      {showSelectJobDialog && (
        <SelectJobDialog
          open={showSelectJobDialog}
          onClose={() => setShowSelectJobDialog(false)}
          onJobSelect={handleJobSelect}
          userLocation={userLocation}
        />
      )}
    </Box>
  );
}
