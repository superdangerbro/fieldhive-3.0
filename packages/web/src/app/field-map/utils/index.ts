/**
 * Field map utilities
 * Centralizes map-related utility functions
 */

export * from './mapHelpers';
export * from './offlineStorage';

/**
 * Example Usage:
 * ```typescript
 * // Map helpers
 * import { 
 *   calculateDistance,
 *   isPointInBounds,
 *   formatCoordinates 
 * } from './utils';
 * 
 * // Offline storage
 * import {
 *   initDB,
 *   saveProperties,
 *   getPropertiesInBounds
 * } from './utils';
 * 
 * // Calculate distance between points
 * const distance = calculateDistance(point1, point2);
 * 
 * // Save offline data
 * await saveProperties(properties);
 * ```
 */
