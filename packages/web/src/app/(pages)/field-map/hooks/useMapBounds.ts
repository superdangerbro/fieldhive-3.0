import { useCallback, useState, useEffect } from 'react';
import type { MapRef } from 'react-map-gl';
import type { BoundsArray } from '../types';

/**
 * Hook for managing map bounds and related operations
 * 
 * Features:
 * - Tracks current map bounds
 * - Provides bounds calculation utilities
 * - Handles bounds-based data fetching
 * 
 * @param mapRef - Reference to the map instance
 * @param onBoundsChange - Optional callback when bounds change
 * @returns Bounds management utilities
 */
export function useMapBounds(
  mapRef: React.RefObject<MapRef>,
  onBoundsChange?: (bounds: BoundsArray) => void
) {
  const [currentBounds, setCurrentBounds] = useState<BoundsArray | null>(null);

  /**
   * Calculate bounds array from map instance
   */
  const calculateBounds = useCallback((): BoundsArray | null => {
    const map = mapRef.current?.getMap();
    if (!map) {
      console.warn('Map instance not available');
      return null;
    }

    const bounds = map.getBounds();
    if (!bounds) {
      console.warn('Could not get map bounds');
      return null;
    }

    const boundsArray: BoundsArray = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ];

    console.log('Calculated bounds:', boundsArray);
    return boundsArray;
  }, [mapRef]);

  /**
   * Update bounds and notify listeners
   */
  const updateBounds = useCallback(() => {
    const bounds = calculateBounds();
    if (bounds) {
      console.log('Calculating new bounds:', bounds);
      onBoundsChange?.(bounds);
    }
  }, [calculateBounds, onBoundsChange]);

  // Set up map event listeners
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Update bounds on relevant map events
    map.on('moveend', updateBounds);
    map.on('zoomend', updateBounds);

    // Initial bounds calculation
    updateBounds();

    return () => {
      map.off('moveend', updateBounds);
      map.off('zoomend', updateBounds);
    };
  }, [mapRef, updateBounds]);

  /**
   * Check if a point is within current bounds
   */
  const isInBounds = useCallback((longitude: number, latitude: number): boolean => {
    if (!currentBounds) return false;

    const [west, south, east, north] = currentBounds;
    return (
      longitude >= west &&
      longitude <= east &&
      latitude >= south &&
      latitude <= north
    );
  }, [currentBounds]);

  /**
   * Calculate bounds padding to ensure visibility
   */
  const getPadding = useCallback((margin: number = 0.001): BoundsArray => {
    if (!currentBounds) {
      console.warn('No current bounds available');
      return [-180, -90, 180, 90]; // World bounds
    }

    const [west, south, east, north] = currentBounds;
    return [
      west - margin,
      south - margin,
      east + margin,
      north + margin
    ];
  }, [currentBounds]);

  return {
    currentBounds,
    calculateBounds,
    updateBounds,
    isInBounds,
    getPadding
  };
}
