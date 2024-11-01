import type { BoundsArray, Coordinates, MapBounds } from '../types';

/**
 * Convert bounds array to bounds object
 * @param bounds - [west, south, east, north]
 */
export const boundsArrayToObject = (bounds: BoundsArray): MapBounds => ({
  west: bounds[0],
  south: bounds[1],
  east: bounds[2],
  north: bounds[3]
});

/**
 * Convert bounds object to bounds array
 * @param bounds - Bounds object
 */
export const boundsObjectToArray = (bounds: MapBounds): BoundsArray => [
  bounds.west,
  bounds.south,
  bounds.east,
  bounds.north
];

/**
 * Calculate distance between two points in meters
 * Uses Haversine formula
 */
export const calculateDistance = (
  point1: Coordinates,
  point2: Coordinates
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1[1] * Math.PI/180;
  const φ2 = point2[1] * Math.PI/180;
  const Δφ = (point2[1] - point1[1]) * Math.PI/180;
  const Δλ = (point2[0] - point1[0]) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

/**
 * Check if a point is within bounds
 */
export const isPointInBounds = (
  point: Coordinates,
  bounds: BoundsArray
): boolean => {
  const [lng, lat] = point;
  const [west, south, east, north] = bounds;
  return lng >= west && lng <= east && lat >= south && lat <= north;
};

/**
 * Calculate center point of bounds
 */
export const getBoundsCenter = (bounds: BoundsArray): Coordinates => {
  const [west, south, east, north] = bounds;
  return [
    west + (east - west) / 2,
    south + (north - south) / 2
  ];
};

/**
 * Calculate bounds that include all points with padding
 */
export const getBoundsForPoints = (
  points: Coordinates[],
  padding: number = 0.001
): BoundsArray => {
  if (points.length === 0) {
    throw new Error('No points provided');
  }

  const lngs = points.map(p => p[0]);
  const lats = points.map(p => p[1]);

  return [
    Math.min(...lngs) - padding,
    Math.min(...lats) - padding,
    Math.max(...lngs) + padding,
    Math.max(...lats) + padding
  ];
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (
  coordinates: Coordinates,
  precision: number = 6
): string => {
  const [lng, lat] = coordinates;
  return `${lng.toFixed(precision)}, ${lat.toFixed(precision)}`;
};

/**
 * Calculate bearing between two points
 * Returns angle in degrees (0-360)
 */
export const calculateBearing = (
  start: Coordinates,
  end: Coordinates
): number => {
  const startLat = start[1] * Math.PI/180;
  const startLng = start[0] * Math.PI/180;
  const endLat = end[1] * Math.PI/180;
  const endLng = end[0] * Math.PI/180;

  const y = Math.sin(endLng - startLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) -
          Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
  const θ = Math.atan2(y, x);

  return ((θ * 180/Math.PI) + 360) % 360;
};

/**
 * Calculate a point at a given distance and bearing from start
 * @param start - Starting coordinates
 * @param distance - Distance in meters
 * @param bearing - Bearing in degrees
 */
export const calculateDestination = (
  start: Coordinates,
  distance: number,
  bearing: number
): Coordinates => {
  const R = 6371e3; // Earth's radius in meters
  const δ = distance / R; // angular distance
  const θ = bearing * Math.PI/180; // bearing in radians
  const φ1 = start[1] * Math.PI/180; // lat in radians
  const λ1 = start[0] * Math.PI/180; // lng in radians

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) +
    Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );

  const λ2 = λ1 + Math.atan2(
    Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
    Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
  );

  return [
    ((λ2 * 180/Math.PI) + 540) % 360 - 180, // normalize lng
    φ2 * 180/Math.PI // lat
  ];
};

/**
 * Debug helper to log map state
 */
export const debugMapState = (
  bounds: BoundsArray,
  center: Coordinates,
  zoom: number
): void => {
  console.group('Map State');
  console.log('Bounds:', boundsArrayToObject(bounds));
  console.log('Center:', formatCoordinates(center));
  console.log('Zoom:', zoom);
  console.groupEnd();
};
