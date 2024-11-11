'use client';

import React from 'react';
import { Marker } from 'react-map-gl';
import type { MarkerDragEvent } from 'react-map-gl';
import type { MapMarkerEditorProps } from './types';

export default function MapMarkerEditor({
    location,
    onLocationChange,
    themeColor
}: MapMarkerEditorProps) {
    const handleDragEnd = (event: MarkerDragEvent) => {
        const { lng, lat } = event.lngLat;
        // Already in [lat, lng] format from usePropertyLocation
        const newCoords: [number, number] = [lat, lng];
        onLocationChange(newCoords);
    };

    return (
        <Marker
            longitude={location[1]}
            latitude={location[0]}
            draggable
            onDragEnd={handleDragEnd}
            color={themeColor}
        />
    );
}
