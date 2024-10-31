'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Point, Polygon } from 'geojson';

interface MapDialogProps {
  open: boolean;
  onClose: () => void;
  initialLocation?: [number, number];
  mode: 'marker' | 'polygon';
  onLocationSelect?: (coordinates: [number, number]) => void;
  onBoundarySelect?: (polygon: Polygon) => void;
  title?: string;
}

export default function MapDialog({ 
  open, 
  onClose, 
  initialLocation, 
  mode,
  onLocationSelect,
  onBoundarySelect,
  title = 'Edit Location'
}: MapDialogProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | undefined>(initialLocation);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    if (!open || !mapContainer.current || mapInitialized) return;

    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        console.error('Mapbox token is not configured');
        return;
      }

      mapboxgl.accessToken = token;

      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: initialLocation || [-123.1207, 49.2827],
        zoom: initialLocation ? 15 : 11,
        preserveDrawingBuffer: true
      });

      newMap.on('load', () => {
        console.log('Map loaded successfully');
        setMapInitialized(true);
      });

      newMap.on('error', (e) => {
        console.error('Map error:', e);
      });

      map.current = newMap;

      if (mode === 'marker') {
        const newMarker = new mapboxgl.Marker({
          draggable: true,
          color: '#FF0000'
        })
          .setLngLat(initialLocation || [-123.1207, 49.2827])
          .addTo(newMap);

        newMarker.on('dragend', () => {
          const lngLat = newMarker.getLngLat();
          setSelectedLocation([lngLat.lng, lngLat.lat]);
        });

        newMap.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          newMarker.setLngLat([lng, lat]);
          setSelectedLocation([lng, lat]);
        });

        marker.current = newMarker;
      } else if (mode === 'polygon') {
        const drawInstance = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          },
          defaultMode: 'draw_polygon'
        });

        newMap.addControl(drawInstance);
        draw.current = drawInstance;

        newMap.on('draw.create', () => {
          const data = drawInstance.getAll();
          if (data.features.length > 0 && onBoundarySelect) {
            const polygon = data.features[0].geometry as Polygon;
            onBoundarySelect(polygon);
          }
        });

        newMap.on('draw.update', () => {
          const data = drawInstance.getAll();
          if (data.features.length > 0 && onBoundarySelect) {
            const polygon = data.features[0].geometry as Polygon;
            onBoundarySelect(polygon);
          }
        });

        newMap.on('draw.delete', () => {
          if (onBoundarySelect) {
            onBoundarySelect(null as any);
          }
        });
      }

      newMap.addControl(new mapboxgl.NavigationControl());

      return () => {
        if (marker.current) {
          marker.current.remove();
        }
        if (draw.current) {
          newMap.removeControl(draw.current);
        }
        newMap.remove();
        map.current = null;
        setMapInitialized(false);
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [open, initialLocation, mapInitialized, mode, onBoundarySelect]);

  const handleSave = () => {
    if (mode === 'marker' && selectedLocation && onLocationSelect) {
      onLocationSelect(selectedLocation);
    }
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
          maxHeight: '90vh',
          height: 'auto'
        }
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box
          ref={mapContainer}
          sx={{
            height: '500px',
            width: '100%',
            position: 'relative',
            '& .mapboxgl-canvas': {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100% !important',
              height: '100% !important'
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          disabled={mode === 'marker' ? !selectedLocation : false}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
