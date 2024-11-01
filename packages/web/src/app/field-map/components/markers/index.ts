/**
 * Map marker components
 * Centralizes all map markers in one place
 */

import { PropertyMarker } from './PropertyMarker';
import { UserLocationMarker } from './UserLocationMarker';

export {
    PropertyMarker,
    UserLocationMarker
};

/**
 * Example Usage:
 * ```typescript
 * import { PropertyMarker, UserLocationMarker } from './components/markers';
 * 
 * // In map component
 * <>
 *   <PropertyMarker
 *     property={propertyData}
 *     onClick={handlePropertyClick}
 *   />
 *   <UserLocationMarker
 *     longitude={userLng}
 *     latitude={userLat}
 *     heading={deviceHeading}
 *     isTracking={isTracking}
 *   />
 * </>
 * ```
 */
