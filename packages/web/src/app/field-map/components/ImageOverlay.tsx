'use client';

import React, { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

interface ImageOverlayProps {
  id: string;
  imageUrl: string;
  coordinates: [[number, number], [number, number], [number, number], [number, number]];
  opacity: number;
  map: mapboxgl.Map;
}

export const ImageOverlay: React.FC<ImageOverlayProps> = ({ id, imageUrl, coordinates, opacity, map }) => {
  useEffect(() => {
    map.addSource(id, {
      type: 'image',
      url: imageUrl,
      coordinates: coordinates,
    });

    map.addLayer({
      id: id,
      type: 'raster',
      source: id,
      paint: {
        'raster-opacity': opacity,
      },
    });

    return () => {
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    };
  }, [id, imageUrl, coordinates, map]);

  useEffect(() => {
    map.setPaintProperty(id, 'raster-opacity', opacity);
  }, [id, opacity, map]);

  return null;
};
