'use client';

import React from 'react';
import { Box, Skeleton } from '@mui/material';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import type { LocationData, GeoJSONPoint, GeoJSONPolygon } from '../types/location';
import { validateGeoJsonCoordinates } from '../types/location';

interface PropertyLocationMapProps {
    propertyId: string;
    locationData: LocationData | undefined;
    coordinates: [number, number];
    cssLoaded: boolean;
    defaultZoom: number;
    themeColor: string;
}

interface GeoJSONFeature<G> {
    type: 'Feature';
    geometry: G;
    properties: Record<string, any>;
}

export default function PropertyLocationMap({
    propertyId,
    locationData,
    coordinates,
    cssLoaded,
    defaultZoom,
    themeColor
}: PropertyLocationMapProps) {
    if (!cssLoaded) {
        return (
            <Box sx={{ flex: 1, height: 400, borderRadius: 1, overflow: 'hidden' }}>
                <Skeleton variant="rounded" width="100%" height="100%" />
            </Box>
        );
    }

    // Get marker coordinates and validate them
    const location = locationData?.location;
    const markerCoordinates = location?.coordinates;
    const hasMarker = markerCoordinates && 
                     Array.isArray(markerCoordinates) && 
                     markerCoordinates.length === 2 &&
                     validateGeoJsonCoordinates(markerCoordinates[0], markerCoordinates[1]);

    // Get boundary data and validate all coordinates
    const boundary = locationData?.boundary;
    const boundaryCoordinates = boundary?.coordinates?.[0];
    const hasBoundary = boundaryCoordinates && 
                       Array.isArray(boundaryCoordinates) && 
                       boundaryCoordinates.length >= 3 &&
                       boundaryCoordinates.every(([lng, lat]) => 
                           validateGeoJsonCoordinates(lng, lat)
                       );

    // Calculate initial view based on what data we have
    const initialView = {
        longitude: hasMarker && markerCoordinates ? markerCoordinates[0] : coordinates[1],
        latitude: hasMarker && markerCoordinates ? markerCoordinates[1] : coordinates[0],
        zoom: (hasMarker || hasBoundary) ? 17 : defaultZoom
    };

    return (
        <Box sx={{ flex: 1, height: 400, borderRadius: 1, overflow: 'hidden' }}>
            <Map
                key={`${propertyId}-${coordinates.join(',')}-${boundaryCoordinates?.length}`}
                initialViewState={initialView}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                interactive={true}
            >
                {/* Only show marker if coordinates are valid */}
                {hasMarker && markerCoordinates && (
                    <Marker
                        longitude={markerCoordinates[0]}
                        latitude={markerCoordinates[1]}
                        color={themeColor}
                    />
                )}

                {/* Only show boundary if all coordinates are valid */}
                {hasBoundary && boundary && (
                    <Source
                        type="geojson"
                        data={{
                            type: 'Feature',
                            geometry: boundary,
                            properties: {}
                        }}
                    >
                        {/* Fill Layer */}
                        <Layer
                            id="boundary-fill"
                            type="fill"
                            paint={{
                                'fill-color': themeColor,
                                'fill-opacity': 0.3
                            }}
                        />
                        {/* Border Layer */}
                        <Layer
                            id="boundary-line"
                            type="line"
                            paint={{
                                'line-color': themeColor,
                                'line-width': 2
                            }}
                        />
                        {/* Vertex Points Layer */}
                        <Layer
                            id="boundary-points"
                            type="circle"
                            paint={{
                                'circle-radius': 4,
                                'circle-color': themeColor,
                                'circle-stroke-width': 1,
                                'circle-stroke-color': '#fff'
                            }}
                        />
                    </Source>
                )}
            </Map>
        </Box>
    );
}
