'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Alert, Button, Skeleton } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useQueryClient } from '@tanstack/react-query';
import { usePropertyLocation, useUpdatePropertyLocation, useUpdatePropertyBoundary } from '../hooks/usePropertyLocation';
import { asTuple, DEFAULT_LOCATION, DEFAULT_ZOOM, APP_THEME_COLOR } from '../types/location';
import type { Property } from '../../../globalTypes/property';
import type { GeoJSONPolygon, GeoJSONPolygonOrNull, LocationData } from '../types/location';
import PropertyLocationInfo from './PropertyLocationInfo';
import PropertyLocationMap from './PropertyLocationMap';
import PropertyLocationDialogs from './PropertyLocationDialogs';

interface PropertyLocationProps {
    property: Property;
}

export default function PropertyLocation({ property }: PropertyLocationProps) {
    const queryClient = useQueryClient();
    const [cssLoaded, setCssLoaded] = useState(false);
    const [locationDialogOpen, setLocationDialogOpen] = useState(false);
    const [boundaryDialogOpen, setBoundaryDialogOpen] = useState(false);
    const [showLocationPrompt, setShowLocationPrompt] = useState(false);
    const [showBoundaryPrompt, setShowBoundaryPrompt] = useState(false);

    // Use the existing location hook
    const { 
        data: locationData, 
        isLoading,
        error: locationError
    } = usePropertyLocation(property.property_id);

    // Load Mapbox CSS
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
        document.head.appendChild(link);
        link.onload = () => setCssLoaded(true);
        return () => {
            document.head.removeChild(link);
            setCssLoaded(false);
        };
    }, []);

    // React Query mutations
    const { 
        mutate: updateLocation,
        isPending: isUpdatingLocation,
        error: updateLocationError,
        reset: resetLocationError
    } = useUpdatePropertyLocation();

    const { 
        mutate: updateBoundary,
        isPending: isUpdatingBoundary,
        error: updateBoundaryError,
        reset: resetBoundaryError
    } = useUpdatePropertyBoundary();

    // Show prompts for missing data
    useEffect(() => {
        if (locationData) {
            setShowLocationPrompt(!locationData.location);
            setShowBoundaryPrompt(!locationData.boundary);
        }
    }, [locationData]);

    // Get coordinates safely
    const coordinates: [number, number] = useMemo(() => {
        try {
            // First try to use location data
            if (locationData?.location?.coordinates) {
                const [lng, lat] = locationData.location.coordinates;
                if (typeof lng === 'number' && typeof lat === 'number') {
                    return [lat, lng];
                }
            }
            
            // Default location as last resort
            return DEFAULT_LOCATION;
        } catch (error) {
            console.error('Error getting coordinates:', error);
            return DEFAULT_LOCATION;
        }
    }, [locationData]);

    const handleLocationSelect = (coordinates: [number, number]) => {
        resetLocationError();
        const geoJsonCoords: [number, number] = asTuple([coordinates[1], coordinates[0]]);
        
        updateLocation(
            { propertyId: property.property_id, coordinates: geoJsonCoords },
            {
                onSuccess: () => {
                    setLocationDialogOpen(false);
                    setShowLocationPrompt(false);
                }
            }
        );
    };

    const handleBoundarySelect = (polygon: GeoJSONPolygonOrNull) => {
        resetBoundaryError();
        
        if (!polygon) return;

        if (!polygon.coordinates?.[0]) {
            console.warn('Invalid polygon data received');
            return;
        }

        // Pass coordinates directly - they're already in GeoJSON format [lng, lat]
        updateBoundary(
            { propertyId: property.property_id, coordinates: polygon.coordinates[0] },
            {
                onSuccess: () => {
                    setBoundaryDialogOpen(false);
                    setShowBoundaryPrompt(false);
                }
            }
        );
    };

    const handleDeleteBoundary = () => {
        resetBoundaryError();
        updateBoundary(
            { propertyId: property.property_id, coordinates: null },
            {
                onSuccess: () => {
                    setShowBoundaryPrompt(true);
                }
            }
        );
    };

    const getErrorMessage = (error: Error | null) => {
        if (!error) return null;
        return error instanceof Error ? error.message : 'An unexpected error occurred';
    };

    if (isLoading) {
        return (
            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Location</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}><Skeleton variant="rounded" height={400} /></Box>
                    <Box sx={{ flex: 1 }}><Skeleton variant="rounded" height={400} /></Box>
                </Box>
            </Paper>
        );
    }

    if (locationError) {
        return (
            <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">Location</Typography>
                </Box>
                <Alert severity="error">
                    Failed to load location data. Please try again later.
                    {locationError instanceof Error ? `: ${locationError.message}` : ''}
                </Alert>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Location</Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                {/* Location and Boundary Information */}
                <Box sx={{ flex: 1 }}>
                    <PropertyLocationInfo
                        locationData={locationData}
                        showLocationPrompt={showLocationPrompt}
                        showBoundaryPrompt={showBoundaryPrompt}
                        isUpdatingLocation={isUpdatingLocation}
                        isUpdatingBoundary={isUpdatingBoundary}
                        updateLocationError={updateLocationError}
                        updateBoundaryError={updateBoundaryError}
                        onEditLocation={() => setLocationDialogOpen(true)}
                        onEditBoundary={() => setBoundaryDialogOpen(true)}
                        onDeleteBoundary={handleDeleteBoundary}
                        getErrorMessage={getErrorMessage}
                    />
                </Box>

                {/* Map Display */}
                <Box sx={{ flex: 1 }}>
                    <PropertyLocationMap
                        propertyId={property.property_id}
                        locationData={locationData}
                        coordinates={coordinates}
                        cssLoaded={cssLoaded}
                        defaultZoom={DEFAULT_ZOOM}
                        themeColor={APP_THEME_COLOR}
                    />
                </Box>
            </Box>

            {/* Map Dialogs */}
            <PropertyLocationDialogs
                locationData={locationData}
                locationDialogOpen={locationDialogOpen}
                boundaryDialogOpen={boundaryDialogOpen}
                coordinates={coordinates}
                onCloseLocationDialog={() => {
                    setLocationDialogOpen(false);
                    resetLocationError();
                }}
                onCloseBoundaryDialog={() => {
                    setBoundaryDialogOpen(false);
                    resetBoundaryError();
                }}
                onLocationSelect={handleLocationSelect}
                onBoundarySelect={handleBoundarySelect}
            />
        </Paper>
    );
}
