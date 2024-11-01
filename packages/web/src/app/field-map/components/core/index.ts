/**
 * Core map components
 * Centralizes base map functionality
 */

import BaseMap from './BaseMap';
import { MapControls } from './MapControls';
import FieldMap from './components/FieldMap';

export {
    BaseMap,
    MapControls,
    FieldMap
};

/**
 * Example Usage:
 * ```typescript
 * // Using individual components
 * import { BaseMap, MapControls } from './components/core';
 * 
 * <BaseMap ref={mapRef} onMoveEnd={handleMoveEnd}>
 *   <MapControls
 *     onStyleChange={handleStyleChange}
 *     onZoomIn={handleZoomIn}
 *     onZoomOut={handleZoomOut}
 *     isTracking={isTracking}
 *   />
 * </BaseMap>
 * 
 * // Using main map component
 * import { FieldMap } from './components/core';
 * 
 * <FieldMap />
 * ```
 */
