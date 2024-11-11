'use client';

import React from 'react';
import MapDialog from './map/MapDialog';
import type { LocationData, GeoJSONPolygonOrNull } from '../types/location';

interface PropertyLocationDialogsProps {
    locationData: LocationData | undefined;
    locationDialogOpen: boolean;
    boundaryDialogOpen: boolean;
    coordinates: [number, number];
    onCloseLocationDialog: () => void;
    onCloseBoundaryDialog: () => void;
    onLocationSelect: (coordinates: [number, number]) => void;
    onBoundarySelect: (polygon: GeoJSONPolygonOrNull) => void;
}

export default function PropertyLocationDialogs({
    locationData,
    locationDialogOpen,
    boundaryDialogOpen,
    coordinates,
    onCloseLocationDialog,
    onCloseBoundaryDialog,
    onLocationSelect,
    onBoundarySelect
}: PropertyLocationDialogsProps) {
    // Get the initial location for the marker dialog
    const initialMarkerLocation = React.useMemo(() => {
        if (locationData?.location?.coordinates) {
            // Convert from GeoJSON [lng, lat] to display [lat, lng]
            const [lng, lat] = locationData.location.coordinates;
            return [lat, lng] as [number, number];
        }
        return coordinates;
    }, [locationData?.location, coordinates]);

    // Get the initial location for the boundary dialog
    const initialBoundaryLocation = React.useMemo(() => {
        if (locationData?.boundary?.coordinates?.[0]?.[0]) {
            // Use the first point of the boundary if available
            const [lng, lat] = locationData.boundary.coordinates[0][0];
            return [lat, lng] as [number, number];
        }
        if (locationData?.location?.coordinates) {
            // Fall back to marker location if available
            const [lng, lat] = locationData.location.coordinates;
            return [lat, lng] as [number, number];
        }
        return coordinates;
    }, [locationData?.boundary, locationData?.location, coordinates]);

    return (
        <>
            {/* Location Dialog */}
            <MapDialog
                open={locationDialogOpen}
                onClose={onCloseLocationDialog}
                initialLocation={initialMarkerLocation}
                mode="marker"
                onLocationSelect={onLocationSelect}
                title={locationData?.location ? 'Edit Property Location' : 'Add Property Location'}
            />

            {/* Boundary Dialog */}
            <MapDialog
                open={boundaryDialogOpen}
                onClose={onCloseBoundaryDialog}
                initialLocation={initialBoundaryLocation}
                mode="polygon"
                onBoundarySelect={onBoundarySelect}
                initialBoundary={locationData?.boundary}
                title={locationData?.boundary ? 'Edit Property Boundary' : 'Add Property Boundary'}
            />
        </>
    );
}
