'use client';

import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface ImageOverlayProps {
  /** Unique identifier for the overlay */
  id: string;
  /** URL of the image to overlay */
  imageUrl: string;
  /** Array of coordinates defining the four corners of the image overlay
   * Format: [[lng, lat], [lng, lat], [lng, lat], [lng, lat]]
   * Order: Top-left, Top-right, Bottom-right, Bottom-left
   */
  coordinates: [[number, number], [number, number], [number, number], [number, number]];
  /** Opacity of the overlay (0-1) */
  opacity: number;
  /** Reference to the Mapbox map instance */
  map: mapboxgl.Map;
}

/**
 * Component for overlaying images on a Mapbox map
 * Features:
 * - Image overlay with custom coordinates
 * - Adjustable opacity
 * - Automatic cleanup on unmount
 * - Dynamic opacity updates
 * 
 * @component
 * @example
 * ```tsx
 * <ImageOverlay
 *   id="floor-plan-1"
 *   imageUrl="path/to/image.png"
 *   coordinates={[
 *     [lng1, lat1], // Top-left
 *     [lng2, lat2], // Top-right
 *     [lng3, lat3], // Bottom-right
 *     [lng4, lat4]  // Bottom-left
 *   ]}
 *   opacity={0.75}
 *   map={mapInstance}
 * />
 * ```
 */
export function ImageOverlay({ 
  id, 
  imageUrl, 
  coordinates, 
  opacity, 
  map 
}: ImageOverlayProps) {
  // Add image source and layer on mount
  useEffect(() => {
    // Add image source
    map.addSource(id, {
      type: 'image',
      url: imageUrl,
      coordinates: coordinates,
    });

    // Add raster layer
    map.addLayer({
      id: id,
      type: 'raster',
      source: id,
      paint: {
        'raster-opacity': opacity,
      },
    });

    // Cleanup on unmount
    return () => {
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    };
  }, [id, imageUrl, coordinates, map]);

  // Update opacity when it changes
  useEffect(() => {
    map.setPaintProperty(id, 'raster-opacity', opacity);
  }, [id, opacity, map]);

  // This component doesn't render anything directly
  return null;
}
