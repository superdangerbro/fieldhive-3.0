'use client';

import React from 'react';
import { Box } from '@mui/material';
import { Marker, Source, Layer, MarkerDragEvent } from 'react-map-gl';
import type { MapPolygonEditorProps } from './types';
import { createGeoJsonLineString, createGeoJsonPolygonFeature } from './utils';

export default function MapPolygonEditor({
    points,
    onPointsChange,
    themeColor
}: MapPolygonEditorProps) {
    const [isDragging, setIsDragging] = React.useState(false);
    const dragTimeout = React.useRef<NodeJS.Timeout | null>(null);

    const handleDragStart = () => {
        setIsDragging(true);
        if (dragTimeout.current) {
            clearTimeout(dragTimeout.current);
        }
    };

    const handleDragEnd = (index: number, event: MarkerDragEvent) => {
        const { lng, lat } = event.lngLat;
        // Store as [lat, lng] for display
        const newCoords: [number, number] = [lat, lng];
        
        const newPoints = [...points];
        newPoints[index] = newCoords;
        onPointsChange(newPoints);
        
        dragTimeout.current = setTimeout(() => {
            setIsDragging(false);
        }, 200);
    };

    const handleDeletePoint = (index: number) => {
        if (!isDragging) {
            const newPoints = points.filter((_, i) => i !== index);
            onPointsChange(newPoints);
        }
    };

    return (
        <>
            {/* Draw lines */}
            <Source type="geojson" data={createGeoJsonLineString(points)}>
                <Layer
                    id="line-layer"
                    type="line"
                    paint={{
                        'line-color': themeColor,
                        'line-width': 2
                    }}
                />
            </Source>
            
            {/* Draw filled polygon if we have enough points */}
            {points.length >= 3 && (
                <Source type="geojson" data={createGeoJsonPolygonFeature(points)}>
                    <Layer
                        id="polygon-layer"
                        type="fill"
                        paint={{
                            'fill-color': themeColor,
                            'fill-opacity': 0.3
                        }}
                    />
                </Source>
            )}

            {/* Draw draggable points */}
            {points.map((point, index) => (
                <Marker
                    key={index}
                    longitude={point[1]}  // point is [lat, lng]
                    latitude={point[0]}
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
                                backgroundColor: themeColor,
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
    );
}
