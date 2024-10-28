'use client';

import React, { useEffect, useCallback } from 'react';
import Map, { 
  MapRef,
  GeolocateControl,
  Marker
} from 'react-map-gl';
import { Box, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { EquipmentPlacementControls } from './EquipmentPlacementControls';
import { AddEquipmentDialog } from './AddEquipmentDialog';
import { MapControls } from './MapControls';
import { UserLocationMarker } from './UserLocationMarker';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { useMapStore } from '../../stores/mapStore';
import { EquipmentMarkerDialog } from './EquipmentMarkerDialog';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface GeolocateResult {
  coords: {
    latitude: number;
    longitude: number;
    heading: number | null;
  };
}

export default function TechnicianMap() {
  const { 
    viewState, 
    mapStyle, 
    isTracking, 
    userLocation,
    setViewState,
    setMapRef,
    cycleMapStyle,
    toggleTracking,
    setUserLocation,
    setIsTracking,
    cleanup
  } = useMapStore();

  const {
    equipment,
    selectedEquipment,
    isPlacingEquipment,
    isAddEquipmentDialogOpen,
    isMarkerDialogOpen,
    placementLocation,
    startPlacingEquipment,
    cancelPlacingEquipment,
    setPlacementLocation,
    confirmPlacementLocation,
    closeAddEquipmentDialog,
    submitNewEquipment,
    fetchEquipmentInBounds,
    setCurrentBounds,
    openMarkerDialog,
    closeMarkerDialog,
    deleteEquipment,
    updateEquipmentType
  } = useEquipmentStore();

  const mapRef = React.useRef<MapRef>(null);
  const geolocateControlRef = React.useRef<any>(null);
  const hasInitialLocation = React.useRef(false);

  // Set map ref in store
  useEffect(() => {
    if (mapRef.current) {
      setMapRef(mapRef.current);
    }
    return () => cleanup();
  }, [setMapRef, cleanup]);

  // Start tracking on mount
  useEffect(() => {
    if (geolocateControlRef.current) {
      setTimeout(() => {
        geolocateControlRef.current.trigger();
      }, 1000);
    }
  }, []);

  // Update placement location when map moves during placement mode
  useEffect(() => {
    if (isPlacingEquipment && mapRef.current) {
      const center = mapRef.current.getCenter();
      setPlacementLocation([center.lng, center.lat]);
    }
  }, [isPlacingEquipment, viewState, setPlacementLocation]);

  // Handle geolocate events
  const handleGeolocate = useCallback((e: GeolocateResult) => {
    const newLocation = {
      longitude: e.coords.longitude,
      latitude: e.coords.latitude,
      heading: e.coords.heading
    };
    setUserLocation(newLocation);

    // Fly to location on initial position
    if (!hasInitialLocation.current && mapRef.current) {
      hasInitialLocation.current = true;
      mapRef.current.flyTo({
        center: [newLocation.longitude, newLocation.latitude],
        zoom: 18,
        duration: 2000
      });
      setIsTracking(true);
    }
  }, [setUserLocation, setIsTracking]);

  const handleTrackUserLocationStart = useCallback(() => {
    setIsTracking(true);
  }, [setIsTracking]);

  const handleTrackUserLocationEnd = useCallback(() => {
    setIsTracking(false);
  }, [setIsTracking]);

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      const zoom = viewState.zoom + 1;
      mapRef.current.easeTo({ zoom, duration: 300 });
    }
  }, [viewState.zoom]);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      const zoom = viewState.zoom - 1;
      mapRef.current.easeTo({ zoom, duration: 300 });
    }
  }, [viewState.zoom]);

  const handleMoveEnd = useCallback(() => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        const boundsArray: [number, number, number, number] = [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth()
        ];
        setCurrentBounds(boundsArray);
        fetchEquipmentInBounds(boundsArray);
      }
    }
  }, [fetchEquipmentInBounds, setCurrentBounds]);

  const handleMarkerClick = useCallback((equipment: any) => {
    openMarkerDialog(equipment);
  }, [openMarkerDialog]);

  const handleInspect = useCallback((equipment: any) => {
    // Will implement inspection dialog later
    console.log('Inspect equipment:', equipment);
  }, []);

  return (
    <Box 
      sx={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        '.mapboxgl-map': {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        '.mapboxgl-ctrl-top-left': {
          opacity: 0,
          pointerEvents: 'none'
        }
      }}
    >
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onMoveEnd={handleMoveEnd}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <GeolocateControl
          ref={geolocateControlRef}
          position="top-left"
          trackUserLocation
          showUserHeading
          positionOptions={{ 
            enableHighAccuracy: true,
            timeout: 6000,
            maximumAge: 0
          }}
          onGeolocate={handleGeolocate}
          onTrackUserLocationStart={handleTrackUserLocationStart}
          onTrackUserLocationEnd={handleTrackUserLocationEnd}
        />

        {/* Render user location marker when we have coordinates */}
        {userLocation && (
          <UserLocationMarker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
            heading={userLocation.heading}
          />
        )}

        {/* Render equipment markers */}
        {equipment.map(item => (
          <Marker
            key={item.equipment_id}
            longitude={item.location.coordinates[0]}
            latitude={item.location.coordinates[1]}
            onClick={() => handleMarkerClick(item)}
          >
            <div style={{ 
              width: 20, 
              height: 20, 
              background: '#3b82f6',
              borderRadius: '50%',
              border: '2px solid white',
              cursor: 'pointer'
            }} />
          </Marker>
        ))}
      </Map>

      <MapControls
        onStyleChange={cycleMapStyle}
        onTrackingToggle={() => {
          if (geolocateControlRef.current) {
            const control = geolocateControlRef.current;
            if (!isTracking) {
              control.trigger();
            } else {
              control._clearWatch();
            }
          }
          toggleTracking();
        }}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isTracking={isTracking}
      />

      {/* Equipment placement mode */}
      {isPlacingEquipment ? (
        <EquipmentPlacementControls
          onConfirm={confirmPlacementLocation}
          onCancel={cancelPlacingEquipment}
        />
      ) : (
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
            backgroundColor: '#3b82f6',
            '&:hover': {
              backgroundColor: '#2563eb'
            }
          }}
        >
          <AddIcon sx={{ fontSize: 36 }} />
        </Fab>
      )}

      {/* Add equipment dialog */}
      {isAddEquipmentDialogOpen && placementLocation && (
        <AddEquipmentDialog
          open={isAddEquipmentDialogOpen}
          location={placementLocation}
          onClose={closeAddEquipmentDialog}
          onSubmit={submitNewEquipment}
        />
      )}

      {/* Equipment marker dialog */}
      {isMarkerDialogOpen && selectedEquipment && (
        <EquipmentMarkerDialog
          open={isMarkerDialogOpen}
          equipment={selectedEquipment}
          onClose={closeMarkerDialog}
          onDelete={deleteEquipment}
          onInspect={handleInspect}
          onUpdateType={updateEquipmentType}
        />
      )}
    </Box>
  );
}
