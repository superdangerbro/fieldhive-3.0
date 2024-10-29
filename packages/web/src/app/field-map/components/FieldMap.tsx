'use client';

import React, { useEffect, useCallback } from 'react';
import Map, { 
  MapRef,
  Marker,
  GeolocateControl
} from 'react-map-gl';
import { Box, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { AddEquipmentDialog } from '../components/AddEquipmentDialog';
import { MapControls } from '../components/MapControls';
import { useEquipmentStore } from '../../../stores/equipmentStore';
import { useMapStore } from '../../../stores/mapStore';
import { EquipmentMarkerDialog } from '../components/EquipmentMarkerDialog';
import { EquipmentPlacementControls } from '../components/EquipmentPlacementControls';
import { Crosshairs } from '../components/Crosshairs';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const TRACKING_ZOOM = 17;

export default function FieldMap() {
  const { 
    viewState, 
    mapStyle, 
    isTracking, 
    setViewState,
    setMapRef,
    cycleMapStyle,
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
  const geolocateControlRef = React.useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      setMapRef(mapRef.current);
    }
    return () => cleanup();
  }, [setMapRef, cleanup]);

  // Auto-trigger geolocation on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (geolocateControlRef.current) {
        geolocateControlRef.current.trigger();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (isPlacingEquipment && mapRef.current) {
      const center = mapRef.current.getCenter();
      setPlacementLocation([center.lng, center.lat]);
    }
  }, [isPlacingEquipment, viewState, setPlacementLocation]);

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
        '.mapboxgl-ctrl-geolocate': {
          backgroundColor: '#007cbf',
          borderRadius: '50%',
          margin: '16px',
          width: '40px',
          height: '40px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          '&:hover': {
            backgroundColor: '#006ba3',
          },
          '& button': {
            width: '40px',
            height: '40px',
          },
          '& .mapboxgl-ctrl-icon': {
            filter: 'brightness(0) invert(1)',
          }
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
          position="top-right"
          trackUserLocation
          showUserHeading
          showAccuracyCircle={false}
          positionOptions={{ enableHighAccuracy: true }}
          onTrackUserLocationStart={() => setIsTracking(true)}
          onTrackUserLocationEnd={() => setIsTracking(false)}
        />

        {equipment.map(item => (
          <Marker
            key={item.equipment_id}
            longitude={item.location.coordinates[0]}
            latitude={item.location.coordinates[1]}
            onClick={() => handleMarkerClick(item)}
          >
            <div style={{ 
              width: 12,
              height: 12,
              background: '#007cbf',
              borderRadius: '50%',
              cursor: 'pointer',
              boxShadow: '0 0 0 4px rgba(0, 124, 191, 0.3)'
            }} />
          </Marker>
        ))}
      </Map>

      {isPlacingEquipment && <Crosshairs />}

      <MapControls
        onStyleChange={cycleMapStyle}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isTracking={isTracking}
      />

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
            backgroundColor: '#007cbf',
            '&:hover': {
              backgroundColor: '#006ba3'
            }
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
}
