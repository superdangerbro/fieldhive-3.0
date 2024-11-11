'use client';

import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import type { LocationData } from '../types/location';
import { safeGeoJsonToDisplay } from '../types/location';

interface PropertyLocationInfoProps {
    locationData: LocationData | undefined;
    showLocationPrompt?: boolean;
    showBoundaryPrompt?: boolean;
    isUpdatingLocation?: boolean;
    isUpdatingBoundary?: boolean;
    updateLocationError?: Error | null;
    updateBoundaryError?: Error | null;
    onEditLocation?: () => void;
    onEditBoundary?: () => void;
    onDeleteBoundary?: () => void;
    getErrorMessage?: (error: Error | null) => string | null;
}

const PropertyLocationInfo: React.FC<PropertyLocationInfoProps> = ({
    locationData,
    showLocationPrompt,
    showBoundaryPrompt,
    isUpdatingLocation,
    isUpdatingBoundary,
    updateLocationError,
    updateBoundaryError,
    onEditLocation,
    onEditBoundary,
    onDeleteBoundary,
    getErrorMessage
}) => {
    const getDisplayCoordinates = () => {
        if (!locationData?.location?.coordinates) return null;
        // Convert from GeoJSON [lng, lat] to display [lat, lng]
        const displayCoords = safeGeoJsonToDisplay(locationData.location.coordinates);
        if (!displayCoords) return null;
        return displayCoords;
    };

    const displayCoords = getDisplayCoordinates();

    return (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Location Information */}
                <Box>
                    <Typography variant="subtitle1" gutterBottom>Property Location</Typography>
                    {displayCoords && (
                        <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                            Latitude: {displayCoords[0].toFixed(6)}
                            {'\n'}
                            Longitude: {displayCoords[1].toFixed(6)}
                        </Typography>
                    )}
                    {onEditLocation && (
                        <Button
                            variant="outlined"
                            onClick={onEditLocation}
                            disabled={isUpdatingLocation}
                            sx={{
                                borderColor: '#6366f1',
                                color: '#6366f1',
                                '&:hover': {
                                    borderColor: '#4f46e5',
                                    backgroundColor: 'rgba(99, 102, 241, 0.04)'
                                }
                            }}
                        >
                            {locationData?.location ? 'Edit' : 'Add'}
                        </Button>
                    )}
                </Box>

                {/* Boundary Information */}
                <Box>
                    <Typography variant="subtitle1" gutterBottom>Property Boundary</Typography>
                    {locationData?.boundary && (
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            {/* Subtract 1 because the first and last points are the same */}
                            {locationData.boundary.coordinates[0].length - 1} points defined
                        </Typography>
                    )}
                    {onEditBoundary && (
                        <Button
                            variant="outlined"
                            onClick={onEditBoundary}
                            disabled={isUpdatingBoundary}
                            sx={{
                                borderColor: '#6366f1',
                                color: '#6366f1',
                                '&:hover': {
                                    borderColor: '#4f46e5',
                                    backgroundColor: 'rgba(99, 102, 241, 0.04)'
                                }
                            }}
                        >
                            {locationData?.boundary ? 'Edit' : 'Add'}
                        </Button>
                    )}
                </Box>
            </Box>

            {showLocationPrompt && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Please set the property location
                </Alert>
            )}

            {updateLocationError && getErrorMessage && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {getErrorMessage(updateLocationError)}
                </Alert>
            )}

            {showBoundaryPrompt && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    You can also set a property boundary
                </Alert>
            )}

            {updateBoundaryError && getErrorMessage && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {getErrorMessage(updateBoundaryError)}
                </Alert>
            )}

            {locationData?.boundary && onDeleteBoundary && (
                <Box sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={onDeleteBoundary}
                        disabled={isUpdatingBoundary}
                        size="small"
                    >
                        Delete Boundary
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default PropertyLocationInfo;
