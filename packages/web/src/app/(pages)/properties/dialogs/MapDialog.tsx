'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton } from '@mui/material';
import Map, { Marker, NavigationControl, Source, Layer, MapLayerMouseEvent, MarkerDragEvent } from 'react-map-gl';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import type { LngLat } from 'mapbox-gl';
import '../styles/mapbox.css';

interface MapDialogProps {
  open: boolean;
  onClose: () => void;
  initialLocation: [number, number];  // [latitude, longitude]
  mode: 'marker' | 'polygon';
  onLocationSelect?: (coordinates: [number, number]) => void;  // Will return [latitude, longitude]
  onBoundarySelect?: (polygon: {
    type: 'Polygon';
    coordinates: Array<Array<[number, number]>>;  // Will return array of [longitude, latitude]
  }) => void;
  title?: string;
  initialBoundary?: {
    type: string;
    coordinates: Array<Array<[number, number]>>;  // Expects GeoJSON format [longitude, latitude]
  };
}

const APP_THEME_COLOR = '#6366f1';

// Helper function to compare coordinates
function areCoordinatesEqual(coord1: [number, number], coord2: [number, number]): boolean {
  return coord1[0] === coord2[0] && coord1[1] === coord2[1];
}

// Helper function to validate coordinates in display format [lat, lng]
function validateCoordinates(lat: number, lng: number): boolean {
  // Add debug logging
  console.log('Validating coordinates:', { lat, lng });
  const isValid = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  console.log('Coordinates valid:', isValid);
  return isValid;
}

// Helper function to validate coordinates in GeoJSON format [lng, lat]
function validateGeoJsonCoordinates(lng: number, lat: number): boolean {
  return !isNaN(lng) && !isNaN(lat) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Helper function to safely convert GeoJSON coordinates to display coordinates
function safeGeoJsonToDisplay(coord: [number, number]): [number, number] | null {
  try {
    // GeoJSON coordinates are [longitude, latitude]
    const [lng, lat] = coord;
    
    // Validate coordinates in GeoJSON order
    if (validateGeoJsonCoordinates(lng, lat)) {
      return [lat, lng];  // Return as [latitude, longitude]
    }
    return null;
  } catch (err) {
    console.error('Error converting coordinates:', err);
    return null;
  }
}

// Helper function to convert display coordinates to GeoJSON coordinates
function displayToGeoJson(coords: [number, number]): [number, number] {
  return [coords[1], coords[0]];  // Convert [lat, lng] to [lng, lat]
}

export default function MapDialog({ 
  open, 
  onClose, 
  initialLocation,
  mode,
  onLocationSelect,
  onBoundarySelect,
  title = 'Edit Location',
  initialBoundary
}: MapDialogProps) {
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>(initialLocation);
  const [polygonPoints, setPolygonPoints] = useState<Array<[number, number]>>([]);
  const [history, setHistory] = useState<Array<Array<[number, number]>>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [drawingInstructions, setDrawingInstructions] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize polygon points from initialBoundary if provided
  useEffect(() => {
    if (mode === 'polygon' && initialBoundary?.coordinates?.[0]) {
      try {
        console.log('Raw boundary data:', initialBoundary);
        
        // Convert and validate each coordinate
        const points = initialBoundary.coordinates[0];
        const validPoints: [number, number][] = [];
        
        for (const coord of points) {
          const displayCoord = safeGeoJsonToDisplay(coord as [number, number]);
          if (displayCoord) {
            validPoints.push(displayCoord);
          }
        }
        
        console.log('Converted points:', validPoints);
        
        if (validPoints.length < 3) {
          throw new Error('Not enough valid points to form a polygon');
        }
        
        // Remove closing point if polygon is closed
        const uniquePoints = areCoordinatesEqual(
          validPoints[0], 
          validPoints[validPoints.length - 1]
        ) ? validPoints.slice(0, -1) : validPoints;
        
        console.log('Final points:', uniquePoints);
        
        setPolygonPoints(uniquePoints);
        setHistory([uniquePoints]);
        setHistoryIndex(0);
        setDrawingInstructions(false);
      } catch (err) {
        console.error('Error initializing polygon:', err);
        setError('Failed to initialize polygon boundary');
      }
    }
  }, [mode, initialBoundary]);

  const addToHistory = (points: Array<[number, number]>) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(points);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const distanceToLineSegment = (
    point: [number, number],
    lineStart: [number, number],
    lineEnd: [number, number]
  ): number => {
    const dx = lineEnd[0] - lineStart[0];
    const dy = lineEnd[1] - lineStart[1];
    const len2 = dx * dx + dy * dy;
    
    if (len2 === 0) return Math.sqrt(
      Math.pow(point[0] - lineStart[0], 2) + 
      Math.pow(point[1] - lineStart[1], 2)
    );

    let t = ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) / len2;
    t = Math.max(0, Math.min(1, t));

    const projX = lineStart[0] + t * dx;
    const projY = lineStart[1] + t * dy;

    return Math.sqrt(
      Math.pow(point[0] - projX, 2) + 
      Math.pow(point[1] - projY, 2)
    );
  };

  const handleClick = (event: MapLayerMouseEvent) => {
    if (isDragging) return;
    
    const { lng, lat } = event.lngLat;
    console.log('Click coordinates:', { lat, lng });

    // Validate coordinates
    if (!validateCoordinates(lat, lng)) {
      setError('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
      return;
    }
    
    const displayCoords: [number, number] = [lat, lng];  // Store as [latitude, longitude]
    
    if (mode === 'marker') {
      console.log('Map clicked (marker):', { lat, lng });
      setSelectedLocation(displayCoords);
    } else if (mode === 'polygon') {
      if (polygonPoints.length < 2) {
        const newPoints = [...polygonPoints, displayCoords];
        setPolygonPoints(newPoints);
        addToHistory(newPoints);
        setDrawingInstructions(false);
      } else {
        let minDistance = Infinity;
        let insertIndex = -1;

        for (let i = 0; i < polygonPoints.length - 1; i++) {
          const distance = distanceToLineSegment(
            displayCoords,
            polygonPoints[i],
            polygonPoints[i + 1]
          );
          if (distance < minDistance) {
            minDistance = distance;
            insertIndex = i + 1;
          }
        }

        if (minDistance < 0.0001) {
          const newPoints = [
            ...polygonPoints.slice(0, insertIndex),
            displayCoords,
            ...polygonPoints.slice(insertIndex)
          ];
          setPolygonPoints(newPoints);
          addToHistory(newPoints);
        } else {
          const newPoints = [...polygonPoints, displayCoords];
          setPolygonPoints(newPoints);
          addToHistory(newPoints);
        }
        setDrawingInstructions(false);
      }
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPolygonPoints(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPolygonPoints(history[historyIndex + 1]);
    }
  };

  const handleDeletePoint = (index: number) => {
    if (!isDragging) {
      const newPoints = polygonPoints.filter((_, i) => i !== index);
      setPolygonPoints(newPoints);
      addToHistory(newPoints);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
    if (dragTimeout.current) {
      clearTimeout(dragTimeout.current);
    }
  };

  const handleDragEnd = (index: number, event: MarkerDragEvent) => {
    const { lng, lat } = event.lngLat;
    console.log('Drag end coordinates:', { lat, lng });

    // Validate coordinates
    if (!validateCoordinates(lat, lng)) {
      setError('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
      return;
    }

    // Keep coordinates in [latitude, longitude] format consistently
    const displayCoords: [number, number] = [lat, lng];
    const newPoints = [...polygonPoints];
    newPoints[index] = displayCoords;
    setPolygonPoints(newPoints);
    addToHistory(newPoints);
    
    // Set a timeout before allowing clicks again
    dragTimeout.current = setTimeout(() => {
      setIsDragging(false);
    }, 200);
  };

  const handleSave = () => {
    try {
      if (mode === 'marker' && onLocationSelect) {
        console.log('Saving location:', selectedLocation);
        onLocationSelect(selectedLocation);  // Already in [latitude, longitude] format
      } else if (mode === 'polygon' && onBoundarySelect && polygonPoints.length >= 3) {
        // Convert to GeoJSON format and ensure polygon is closed
        const geoJsonPoints = polygonPoints.map(displayToGeoJson);  // Convert to [lng, lat]
        const closedPoints = [...geoJsonPoints];
        if (!areCoordinatesEqual(closedPoints[0], closedPoints[closedPoints.length - 1])) {
          closedPoints.push([...closedPoints[0]]);
        }
        
        console.log('Saving polygon:', closedPoints);
        onBoundarySelect({
          type: 'Polygon',
          coordinates: [closedPoints]  // GeoJSON format [longitude, latitude]
        });
      }
      onClose();
    } catch (err) {
      console.error('Error saving:', err);
      setError('Failed to save changes');
    }
  };

  const handleReset = () => {
    setPolygonPoints([]);
    setHistory([]);
    setHistoryIndex(-1);
    setDrawingInstructions(true);
    setError(null);
  };

  const polygonData = polygonPoints.length >= 3 ? {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [...polygonPoints.map(displayToGeoJson), polygonPoints.map(displayToGeoJson)[0]]
      ]
    },
    properties: {}
  } : null;

  const lineData = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: polygonPoints.map(displayToGeoJson)
    },
    properties: {}
  };

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography color="error">
            Mapbox token is not configured. Please check your environment configuration.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {title}
        {mode === 'polygon' && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {drawingInstructions ? 
              'Click on the map to start drawing the property boundary. Add at least 3 points to create a polygon.' :
              'Click to add points. Click on lines to add control points. Drag points to adjust.'
            }
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        {mode === 'polygon' && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={handleUndo} 
              disabled={historyIndex <= 0}
              size="small"
            >
              <UndoIcon />
            </IconButton>
            <IconButton 
              onClick={handleRedo} 
              disabled={historyIndex >= history.length - 1}
              size="small"
            >
              <RedoIcon />
            </IconButton>
            <Button 
              onClick={handleReset}
              size="small"
              startIcon={<DeleteIcon />}
              sx={{ ml: 'auto' }}
            >
              Clear All
            </Button>
          </Box>
        )}
        
        <Box sx={{ height: 500, position: 'relative' }}>
          <Map
            initialViewState={{
              longitude: initialLocation[1],  // Use longitude for x-coordinate
              latitude: initialLocation[0],   // Use latitude for y-coordinate
              zoom: 17
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            onClick={handleClick}
            attributionControl={false}
          >
            {mode === 'marker' && (
              <Marker
                longitude={selectedLocation[1]}  // Use longitude for x-coordinate
                latitude={selectedLocation[0]}   // Use latitude for y-coordinate
                draggable
                onDragEnd={(event) => {
                  const { lat, lng } = event.lngLat;
                  if (validateCoordinates(lat, lng)) {
                    console.log('Marker dragged to:', { lat, lng });
                    setSelectedLocation([lat, lng]);
                  } else {
                    setError('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
                  }
                }}
                color={APP_THEME_COLOR}
              />
            )}

            {mode === 'polygon' && (
              <>
                {/* Draw lines */}
                <Source type="geojson" data={lineData}>
                  <Layer
                    id="line-layer"
                    type="line"
                    paint={{
                      'line-color': APP_THEME_COLOR,
                      'line-width': 2
                    }}
                  />
                </Source>
                
                {/* Draw filled polygon if we have enough points */}
                {polygonData && (
                  <Source type="geojson" data={polygonData}>
                    <Layer
                      id="polygon-layer"
                      type="fill"
                      paint={{
                        'fill-color': APP_THEME_COLOR,
                        'fill-opacity': 0.3
                      }}
                    />
                  </Source>
                )}

                {/* Draw draggable points */}
                {polygonPoints.map((point, index) => (
                  <Marker
                    key={index}
                    longitude={point[1]}  // Use longitude for x-coordinate
                    latitude={point[0]}   // Use latitude for y-coordinate
                    draggable
                    onDragStart={handleDragStart}
                    onDragEnd={(event) => handleDragEnd(index, event)}
                  >
                    <Box
                      sx={{
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'move'
                      }}
                    >
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          backgroundColor: APP_THEME_COLOR,
                          borderRadius: '50%'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePoint(index);
                        }}
                      />
                    </Box>
                  </Marker>
                ))}
              </>
            )}
            
            <NavigationControl />
          </Map>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          disabled={mode === 'polygon' && polygonPoints.length < 3}
          sx={{
            backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
            '&:not(:disabled)': {
              backgroundImage: 'linear-gradient(to right, #6366f1, #4f46e5)',
            }
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
