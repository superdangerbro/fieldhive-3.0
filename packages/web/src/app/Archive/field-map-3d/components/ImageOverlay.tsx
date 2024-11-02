'use client';

import React from 'react';
import { Source, Layer } from 'react-map-gl';

interface ImageOverlayProps {
  id: string;
  imageUrl: string;
  coordinates: [number, number][];
  opacity?: number;
}

export function ImageOverlay({ id, imageUrl, coordinates, opacity = 0.8 }: ImageOverlayProps) {
  return (
    <Source
      type="image"
      id={id}
      url={imageUrl}
      coordinates={coordinates}
    >
      <Layer
        id={`layer-${id}`}
        type="raster"
        paint={{
          'raster-opacity': opacity,
          'raster-fade-duration': 0,
          'raster-resampling': 'linear',
          'raster-contrast': 0,
          'raster-brightness-min': 0,
          'raster-brightness-max': 1
        }}
        layout={{
          visibility: 'visible'
        }}
      />
    </Source>
  );
}
