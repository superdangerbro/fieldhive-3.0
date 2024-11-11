'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton } from '@mui/material';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { displayToGeoJson, safeGeoJsonToDisplay } from '../../types/location';

interface MapDialogProps {
  open: boolean;
  onClose: () => void;
  initialLocation: [number, number];  // [lat, lng]
  mode: 'marker' | 'polygon';
  onLocationSelect?: (coordinates: [number, number]) => void;  // Will return [lat, lng]
  onBoundarySelect?: (polygon: {
    type: 'Polygon';
    coordinates: Array<Array<[number, number]>>;  // Will return [[lng, lat], ...]
  }) => void;
  title?: string;
  initialBoundary?: {
    type: string;
    coordinates: Array<Array<[number, number]>>;  // Expects [[lng, lat], ...]
  };
}

const APP_THEME_COLOR = '#6366f1';

function areCoordinatesEqual(coord1: [number, number], coord2: [number, number]): boolean {
  return coord1[0] === coord2[0] && coord1[1] === coord2[1];
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
  // Convert initial location to GeoJSON format [lng, lat]
  const initialGeoJson = displayToGeoJson(initialLocation);
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>(initialGeoJson);
  const [cssLoaded, setCssLoaded] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<Array<[number, number]>>([]);  // Store as [lng, lat]
  const [history, setHistory] = useState<Array<Array<[number, number]>>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [drawingInstructions, setDrawingInstructions] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize polygon points from initialBoundary if provided
  useEffect(() => {
    if (mode === 'polygon' && initialBoundary?.coordinates?.[0]) {
      const points = initialBoundary.coordinates[0];
      const uniquePoints = areCoordinatesEqual(
        points[0], 
        points[points.length - 1]
      ) ? points.slice(0, -1) : points;
      
      setPolygonPoints(uniquePoints);
      setHistory([uniquePoints]);
      setHistoryIndex(0);
      setDrawingInstructions(false);
    }
  }, [mode, initialBoundary]);

  useEffect(() => {
    if (!open) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
    document.head.appendChild(link);

    link.onload = () => {
      setCssLoaded(true);
    };

    return () => {
      document.head.removeChild(link);
      setCssLoaded(false);
      if (dragTimeout.current) {
        clearTimeout(dragTimeout.current);
      }
    };
  }, [open]);

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

  const handleClick = (event: any) => {
    if (isDragging) return;
    
    const { lng, lat } = event.lngLat;
    
    if (mode === 'marker') {
      const geoJsonCoord: [number, number] = [lng, lat];
      setSelectedLocation(geoJsonCoord);
    } else if (mode === 'polygon') {
      const newPoint: [number, number] = [lng, lat];
      
      if (polygonPoints.length < 2) {
        const newPoints = [...polygonPoints, newPoint];
        setPolygonPoints(newPoints);
        addToHistory(newPoints);
        setDrawingInstructions(false);
      } else {
        let minDistance = Infinity;
        let insertIndex = -1;

        for (let i = 0; i < polygonPoints.length - 1; i++) {
          const distance = distanceToLineSegment(
            newPoint,
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
            newPoint,
            ...polygonPoints.slice(insertIndex)
          ];
          setPolygonPoints(newPoints);
          addToHistory(newPoints);
        } else {
          const newPoints = [...polygonPoints, newPoint];
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

  const handleDragEnd = (index: number, event: any) => {
    const { lng, lat } = event.lngLat;
    const newPoints = [...polygonPoints];
    newPoints[index] = [lng, lat];
    setPolygonPoints(newPoints);
    addToHistory(newPoints);
    
    dragTimeout.current = setTimeout(() => {
      setIsDragging(false);
    }, 200);
  };

  const handleSave = () => {
    if (mode === 'marker' && onLocationSelect) {
      const displayCoord = safeGeoJsonToDisplay(selectedLocation);
      if (displayCoord) {
        onLocationSelect(displayCoord);
      }
    } else if (mode === 'polygon' && onBoundarySelect && polygonPoints.length >= 3) {
      const closedPolygon: Array<[number, number]> = [...polygonPoints];
      if (!areCoordinatesEqual(closedPolygon[0], closedPolygon[closedPolygon.length - 1])) {
        closedPolygon.push([...closedPolygon[0]]);
      }
      
      onBoundarySelect({
        type: 'Polygon',
        coordinates: [closedPolygon]
      });
    }
    onClose();
  };

  const handleReset = () => {
    setPolygonPoints([]);
    setHistory([]);
    setHistoryIndex(-1);
    setDrawingInstructions(true);
  };

  const polygonData = polygonPoints.length >= 3 ? {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [...polygonPoints, polygonPoints[0]]
      ]
    },
    properties: {}
  } : null;

  const lineData = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: polygonPoints
    },
    properties: {}
  };

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
          {cssLoaded && (
            <Map
              initialViewState={{
                longitude: initialGeoJson[0],
                latitude: initialGeoJson[1],
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
                  longitude={selectedLocation[0]}
                  latitude={selectedLocation[1]}
                  draggable
                  onDragEnd={(event) => {
                    const { lng, lat } = event.lngLat;
                    setSelectedLocation([lng, lat]);
                  }}
                  color={APP_THEME_COLOR}
                />
              )}

              {mode === 'polygon' && (
                <>
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

                  {polygonPoints.map((point, index) => (
                    <Marker
                      key={index}
                      longitude={point[0]}
                      latitude={point[1]}
                      draggable
                      onDragStart={handleDragStart}
                      onDragEnd={(event) => handleDragEnd(index, event)}
                    >
                      <Box
                        sx={{
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'move',
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePoint(index);
                        }}
                      >
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: APP_THEME_COLOR,
                            borderRadius: '50%',
                            border: '2px solid white'
                          }}
                        />
                      </Box>
                    </Marker>
                  ))}
                </>
              )}
              
              <NavigationControl />
            </Map>
          )}
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
