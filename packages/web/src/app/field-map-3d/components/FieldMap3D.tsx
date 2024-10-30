'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Map, { MapRef, GeolocateControl, Marker } from 'react-map-gl';
import { Box, Fab, IconButton, Tooltip, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import mapboxgl from 'mapbox-gl';

import { MapControls } from '../../field-map/components/MapControls';
import { useEquipmentStore } from '../../../stores/equipmentStore';
import { useFieldMap3DStore } from '../../../stores/fieldMap3dStore';
import { Crosshairs } from '../../field-map/components/Crosshairs';
import { AddEquipmentDialog } from '../../field-map/components/AddEquipmentDialog';
import { EquipmentMarkerDialog } from '../../field-map/components/EquipmentMarkerDialog';
import { FloorControls } from './FloorControls';
import { FloorPlanPlacement } from './FloorPlanPlacement';
import { ImageOverlay } from './ImageOverlay';
import { FloorPlanDialog } from './FloorPlanDialog';
import { PropertySearch } from './PropertySearch';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

const FieldMap3D = () => {
  const theme = useTheme();
  const mapRef = React.useRef<MapRef>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [showFloorPlanDialog, setShowFloorPlanDialog] = useState(false);
  const [isFloorPlansOpen, setIsFloorPlansOpen] = useState(false);
  const [showPropertyMarker, setShowPropertyMarker] = useState(true);
  
  const { 
    floorPlans,
    activeFloorPlan,
    is3DMode,
    isPlacingFloorPlan,
    viewState,
    setViewState,
    toggle3DMode,
    cancelPlacingFloorPlan,
    confirmFloorPlanPlacement,
    selectedProperty,
    flyToProperty,
    searchResults,
    setSelectedProperty
  } = useFieldMap3DStore();

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
    const map = mapRef.current?.getMap();
    if (!map) return;
    
    const targetPitch = is3DMode ? 45 : 0;
    const targetBearing = is3DMode ? 0 : viewState.bearing;
    
    const animate = () => {
      const currentPitch = map.getPitch();
      const currentBearing = map.getBearing();
      
      const pitchDiff = Math.abs(currentPitch - targetPitch);
      const bearingDiff = Math.abs(currentBearing - targetBearing);
      
      if (pitchDiff > 0.1) {
        const newPitch = currentPitch + (targetPitch - currentPitch) * 0.1;
        map.setPitch(newPitch);
        requestAnimationFrame(animate);
      }
      
      if (is3DMode && bearingDiff > 0.1) {
        const newBearing = currentBearing + (targetBearing - currentBearing) * 0.1;
        map.setBearing(newBearing);
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [is3DMode, viewState.bearing]);

  useEffect(() => {
    if (selectedProperty) {
      flyToProperty(selectedProperty);
      // Hide marker after flying to property
      setTimeout(() => setShowPropertyMarker(false), 1000);
    }
  }, [selectedProperty, flyToProperty]);

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
    
    setCurrentBounds(boundsArray);
    fetchEquipmentInBounds(boundsArray);
  }, [fetchEquipmentInBounds, setCurrentBounds]);

  const handleFloorPlanConfirm = useCallback((bounds: {
    west: number;
    east: number;
    north: number;
    south: number;
    coordinates: [number, number][];
  }) => {
    confirmFloorPlanPlacement(bounds, '', 300, 300);
  }, [confirmFloorPlanPlacement]);

  const handleSearchResultClick = useCallback((result: typeof searchResults[0]) => {
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

  return (
    <Box 
      sx={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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

        {/* Search Result Markers */}
        {searchResults.map((result) => (
          <Marker
            key={result.id}
            longitude={result.location.coordinates[0]}
            latitude={result.location.coordinates[1]}
            onClick={() => handleSearchResultClick(result)}
          >
            <Tooltip title={`${result.name} - ${result.address}`}>
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

        {floorPlans.map(floorPlan => (
          floorPlan.visible && floorPlan.bounds && floorPlan.bounds.coordinates && (
            <ImageOverlay
              key={floorPlan.id}
              id={floorPlan.id}
              imageUrl={floorPlan.imageUrl}
              coordinates={floorPlan.bounds.coordinates}
              opacity={floorPlan.id === activeFloorPlan ? 0.8 : 0.4}
            />
          )
        ))}

        {isPlacingFloorPlan && mapRef.current?.getMap() && (
          <FloorPlanPlacement
            onCancel={cancelPlacingFloorPlan}
            onConfirm={handleFloorPlanConfirm}
            map={mapRef.current.getMap()}
          />
        )}
      </Map>

      <PropertySearch 
        onManageFloorPlans={() => setShowFloorPlanDialog(true)}
        isFloorPlansOpen={isFloorPlansOpen}
        onFloorPlansOpenChange={setIsFloorPlansOpen}
      />

      {showFloorPlanDialog && !isPlacingFloorPlan && (
        <FloorPlanDialog
          onClose={() => setShowFloorPlanDialog(false)}
        />
      )}

      {isPlacingEquipment && <Crosshairs />}

      <FloorControls isFloorPlansOpen={isFloorPlansOpen} />

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

      <IconButton
        onClick={toggle3DMode}
        sx={{
          position: 'absolute',
          top: 24,
          right: 90,
          backgroundColor: theme.palette.background.paper,
          color: is3DMode ? theme.palette.primary.main : theme.palette.text.primary,
          '&:hover': { 
            backgroundColor: theme.palette.action.hover 
          },
          boxShadow: theme.shadows[2],
          zIndex: 1000,
        }}
      >
        <ViewInArIcon />
      </IconButton>

      {!isPlacingEquipment && !isPlacingFloorPlan && selectedProperty && (
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

export default FieldMap3D;
