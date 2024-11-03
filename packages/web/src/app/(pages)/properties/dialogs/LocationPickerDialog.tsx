'use client';

import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
} from '@mui/material';
import Map, { MapRef, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Point } from 'geojson';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface LocationPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (location: Point) => void;
  initialLocation?: [number, number];
  address: string;
}

export const LocationPickerDialog: React.FC<LocationPickerDialogProps> = ({
  open,
  onClose,
  onSelect,
  initialLocation = [-98, 56], // Default to center of Canada
  address,
}) => {
  const mapRef = useRef<MapRef>(null);
  const [markerLocation, setMarkerLocation] = useState<[number, number]>(initialLocation);
  const [error, setError] = useState<string>('');

  const handleMapClick = (event: any) => {
    const [lng, lat] = event.lngLat;
    setMarkerLocation([lng, lat]);
  };

  const handleConfirm = () => {
    if (!markerLocation) {
      setError('Please select a location on the map');
      return;
    }

    const point: Point = {
      type: 'Point',
      coordinates: markerLocation
    };

    onSelect(point);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle>Select Property Location</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          We couldn&apos;t automatically locate: {address}
          <br />
          Please click on the map to select your property&apos;s location.
        </Alert>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ height: 400, mt: 2, position: 'relative' }}>
          <Map
            ref={mapRef}
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{
              longitude: initialLocation[0],
              latitude: initialLocation[1],
              zoom: 12,
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            onClick={handleMapClick}
          >
            {markerLocation && (
              <Marker
                longitude={markerLocation[0]}
                latitude={markerLocation[1]}
                color="#FF0000"
              />
            )}
          </Map>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained">
          Confirm Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};
