'use client';

import React, { useEffect, useCallback } from 'react';
import Map, { 
  Marker, 
  MapRef,
  GeolocateControl
} from 'react-map-gl';
import { Box } from '@mui/material';
import 'mapbox-gl/dist/mapbox-gl.css';

import { EquipmentMarker } from './EquipmentMarker';
import { EquipmentInspectionDialog } from './EquipmentInspectionDialog';
import { MapControls } from './MapControls';
import { UserLocationMarker } from './UserLocationMarker';
import { useEquipmentStore } from '@/stores/equipmentStore';
import { useMapStore } from '@/stores/mapStore';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Equipment {
  id: number;
  type: string;
  location: [number, number];
  status: 'active' | 'needs_attention' | 'critical' | 'inactive';
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

  const mapRef = React.useRef<MapRef>(null);
  const geolocateControlRef = React.useRef<any>(null);
  const [selectedEquipment, setSelectedEquipment] = React.useState<Equipment | null>(null);
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = React.useState(false);

  // Set map ref in store and start tracking
  useEffect(() => {
    if (mapRef.current) {
      setMapRef(mapRef.current);
      // Trigger geolocation on mount
      if (geolocateControlRef.current) {
        geolocateControlRef.current.trigger();
      }
    }
    return () => cleanup();
  }, [setMapRef, cleanup]);

  // Handle geolocate events
  const handleGeolocate = useCallback((e: any) => {
    const newLocation = {
      longitude: e.coords.longitude,
      latitude: e.coords.latitude,
      heading: e.coords.heading
    };
    setUserLocation(newLocation);

    // Only fly to location on initial position
    if (!userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [newLocation.longitude, newLocation.latitude],
        zoom: 18,
        duration: 2000
      });
    }
  }, [setUserLocation, userLocation]);

  const handleTrackUserLocationStart = useCallback(() => {
    setIsTracking(true);
  }, [setIsTracking]);

  const handleTrackUserLocationEnd = useCallback(() => {
    setIsTracking(false);
  }, [setIsTracking]);

  const handleEquipmentClick = useCallback((equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsInspectionDialogOpen(true);
  }, []);

  const handleInspectionComplete = useCallback((inspectionData: any) => {
    console.log('Inspection completed:', inspectionData);
    setIsInspectionDialogOpen(false);
    setSelectedEquipment(null);
  }, []);

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

  const handleAdd = useCallback(() => {
    // TODO: Implement add functionality
    console.log('Add button clicked');
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
        onAdd={handleAdd}
        isTracking={isTracking}
      />

      {selectedEquipment && (
        <EquipmentInspectionDialog
          open={isInspectionDialogOpen}
          equipment={selectedEquipment}
          onClose={() => {
            setIsInspectionDialogOpen(false);
            setSelectedEquipment(null);
          }}
          onComplete={handleInspectionComplete}
        />
      )}
    </Box>
  );
}
