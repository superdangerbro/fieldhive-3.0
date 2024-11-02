import type { PointLocation, StandardLocation } from '../types';

/**
 * Convert standard location to point location
 */
export const toPointLocation = (location: StandardLocation): PointLocation => ({
  type: 'Point',
  coordinates: [location.longitude, location.latitude]
});

/**
 * Convert point location to standard location
 */
export const toStandardLocation = (location: PointLocation): StandardLocation => ({
  latitude: location.coordinates[1],
  longitude: location.coordinates[0]
});
