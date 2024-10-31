'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Map, { MapRef, GeolocateControl, Marker } from 'react-map-gl';
import { Box, Fab, IconButton, Tooltip, useTheme, Switch, FormControlLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import mapboxgl from 'mapbox-gl';

import { MapControls } from './MapControls';
import { useEquipmentStore } from '../../../stores/equipmentStore';
import { useFieldMapStore } from '../../../stores/fieldMapStore';
import { Crosshairs } from './Crosshairs';
import { AddEquipmentDialog } from './AddEquipmentDialog';
import { EquipmentMarkerDialog } from './EquipmentMarkerDialog';
import { FloorControls } from './FloorControls';
import { FloorPlanPlacement } from './FloorPlanPlacement';
import { ImageOverlay } from './ImageOverlay';
import { FloorPlanDialog } from './FloorPlanDialog';
import { PropertySearch } from './PropertySearch';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

const FieldMap: React.FC = () => {
  const theme = useTheme();
  const mapRef = useRef<MapRef>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showFloorPlanDialog, setShowFloorPlanDialog] = useState(false);
  const [isFloorPlansOpen, setIsFloorPlansOpen] = useState(false);
  const [showPropertyMarker, setShowPropertyMarker] = useState(true);
  const [showFieldEquipment, setShowFieldEquipment] = useState(false);
  
  const { 
    viewState,
    setViewState,
    selectedProperty,
    flyToProperty,
    properties,
    setSelectedProperty,
    fetchPropertiesInBounds,
    floorPlans,
    activeFloorPlan
  } = useFieldMapStore();

  const {
    isPlacingEquipment,
    isAddEquipmentDialogOpen,
    isMarkerDialogOpen,
    placementLocation,
    startPlacingEquipment,
    closeAddEquipmentDialog,
    submitNewEquipment,
    fetchEquipmentInBounds,
    setCurrentBounds,
    closeMarkerDialog,
    deleteEquipment,
    updateEquipmentType,
    selectedEquipment
  } = useEquipmentStore();

  useEffect(() => {
    console.log('Properties updated:', properties);
  }, [properties]);

  useEffect(() => {
    if (selectedProperty) {
      flyToProperty(selectedProperty);
      // Hide marker after flying to property
      setTimeout(() => setShowPropertyMarker(false), 1000);
    }
  }, [selectedProperty, flyToProperty]);

  useEffect(() => {
    // Fetch initial properties on component mount
    const map = mapRef.current?.getMap();
    if (map) {
      const bounds = map.getBounds();
      if (bounds) {
        const boundsArray: [number, number, number, number] = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth()
        ];
        console.log('Initial bounds:', boundsArray);
        fetchPropertiesInBounds(boundsArray);
      }
    }
  }, [fetchPropertiesInBounds]);

  const handleMoveEnd = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    
    const bounds = map.getBounds();
    if (!bounds) return;

    const boundsArray: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ];
    
    console.log('Map moved, new bounds:', boundsArray);
    setCurrentBounds(boundsArray);
    fetchPropertiesInBounds(boundsArray).then(() => {
      console.log('Properties after fetch:', useFieldMapStore.getState().properties);
    });
    if (showFieldEquipment) {
      fetchEquipmentInBounds(boundsArray);
    }
  }, [fetchPropertiesInBounds, fetchEquipmentInBounds, setCurrentBounds, showFieldEquipment]);

  const handleSearchResultClick = useCallback((result: any) => {
    console.log('Search result clicked:', result);
    setSelectedProperty({
      id: result.id,
      name: result.name,
      location: {
        latitude: result.location.coordinates[1],
        longitude: result.location.coordinates[0]
      }
    });
    setShowPropertyMarker(true);
  }, [setSelectedProperty]);

  const handleToggleFieldEquipment = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setShowFieldEquipment(event.target.checked);
    if (event.target.checked) {
      const map = mapRef.current;
      if (map) {
        const bounds = map.getBounds();
        if (bounds) {
          const boundsArray: [number, number, number, number] = [
            bounds.getWest(),
            bounds.getSouth(),
            bounds.getEast(),
            bounds.getNorth()
          ];
          fetchEquipmentInBounds(boundsArray);
        }
      }
    }
  }, [fetchEquipmentInBounds]);

  return (
    <Box 
      sx={{ 
        height: '100%',
        width: '100%',
        bgcolor: theme.palette.background.default,
        '& .mapboxgl-ctrl-logo': {
          display: 'none'
        }
      }}
    >
      <Map
        ref={mapRef}
        {...viewState}
        reuseMaps
        mapStyle="mapbox://styles/mapbox/dark-v10"
        onMove={evt => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        attributionControl={false}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
          showAccuracyCircle={false}
          positionOptions={{ enableHighAccuracy: true }}
          onTrackUserLocationStart={() => setIsTracking(true)}
          onTrackUserLocationEnd={() => setIsTracking(false)}
        />

        {/* Property Markers */}
        {properties.map((property) => (
          <Marker
            key={property.id}
            longitude={property.location.longitude}
            latitude={property.location.latitude}
            onClick={() => handleSearchResultClick(property)}
          >
            <Tooltip title={`${property.name}`}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: 'info.main',
                  border: '2px solid white',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.2)'
                  }
                }}
              />
            </Tooltip>
          </Marker>
        ))}

        {/* Selected Property Marker */}
        {selectedProperty && showPropertyMarker && (
          <Marker
            longitude={selectedProperty.location.longitude}
            latitude={selectedProperty.location.latitude}
          >
            <Tooltip title={selectedProperty.name}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  border: '3px solid white',
                  boxShadow: theme.shadows[3]
                }}
              />
            </Tooltip>
          </Marker>
        )}

        {/* ImageOverlay for floor plans */}
        {activeFloorPlan && mapRef.current && (
          <ImageOverlay
            id={activeFloorPlan}
            imageUrl={floorPlans.find(fp => fp.id === activeFloorPlan)?.imageUrl || ''}
            coordinates={[
              [selectedProperty?.location.longitude || 0, selectedProperty?.location.latitude || 0],
              [selectedProperty?.location.longitude || 0, (selectedProperty?.location.latitude || 0) + 0.001],
              [(selectedProperty?.location.longitude || 0) + 0.001, (selectedProperty?.location.latitude || 0) + 0.001],
              [(selectedProperty?.location.longitude || 0) + 0.001, selectedProperty?.location.latitude || 0]
            ]}
            opacity={0.75}
            map={mapRef.current.getMap()}
          />
        )}
      </Map>

      <PropertySearch 
        onManageFloorPlans={() => setShowFloorPlanDialog(true)}
        isFloorPlansOpen={isFloorPlansOpen}
        onFloorPlansOpenChange={setIsFloorPlansOpen}
      />

      {showFloorPlanDialog && selectedProperty && (
        <FloorPlanDialog
          open={showFloorPlanDialog}
          onClose={() => setShowFloorPlanDialog(false)}
          propertyId={selectedProperty.id}
        />
      )}

      {isPlacingEquipment && <Crosshairs />}

      <FloorControls
        isFloorPlansOpen={isFloorPlansOpen}
        onAddFloorPlan={() => setShowFloorPlanDialog(true)}
      />

      <MapControls
        onStyleChange={() => {
          const map = mapRef.current?.getMap();
          if (!map) return;
          const style = map.getStyle();
          const isDark = style?.sprite?.includes('dark') ?? true;
          map.setStyle(`mapbox://styles/mapbox/${isDark ? 'light' : 'dark'}-v10`);
        }}
        onZoomIn={() => mapRef.current?.getMap()?.zoomIn()}
        onZoomOut={() => mapRef.current?.getMap()?.zoomOut()}
        isTracking={isTracking}
      />

      <IconButton
        onClick={() => setIsTracking(!isTracking)}
        sx={{
          position: 'absolute',
          top: 24,
          right: 160,
          backgroundColor: theme.palette.background.paper,
          color: isTracking ? theme.palette.primary.main : theme.palette.text.primary,
          '&:hover': { 
            backgroundColor: theme.palette.action.hover 
          },
          boxShadow: theme.shadows[2],
          zIndex: 1000,
        }}
      >
        <LocationOnIcon />
      </IconButton>

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
          left: 330,
          backgroundColor: theme.palette.background.paper,
          padding: '4px 8px',
          borderRadius: 1,
          boxShadow: theme.shadows[2],
          zIndex: 1000,
        }}
      />

      {!isPlacingEquipment && selectedProperty && (
        <Fab
          color="primary"
          onClick={startPlacingEquipment}
          sx={{
            position: 'absolute',
            bottom: 32,
            right: 32,
            zIndex: 1000,
            width: 72,
            height: 72,
          }}
        >
          <AddIcon sx={{ fontSize: 36 }} />
        </Fab>
      )}

      {isAddEquipmentDialogOpen && placementLocation && (
        <AddEquipmentDialog
          open={isAddEquipmentDialogOpen}
          location={placementLocation}
          onClose={closeAddEquipmentDialog}
          onSubmit={submitNewEquipment}
        />
      )}

      {isMarkerDialogOpen && selectedEquipment && (
        <EquipmentMarkerDialog
          open={isMarkerDialogOpen}
          equipment={selectedEquipment}
          onClose={closeMarkerDialog}
          onDelete={deleteEquipment}
          onUpdateType={updateEquipmentType}
        />
      )}
    </Box>
  );
};

export default FieldMap;
