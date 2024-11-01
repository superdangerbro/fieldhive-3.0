/**
 * Overlay-related components for the field map
 */

import FloorPlanLayer from './FloorPlanLayer';
import { FloorControls } from './FloorControls';
import { FloorPlanDialog } from './FloorPlanDialog';
import { ImageOverlay } from './ImageOverlay';
import { FinePlacement } from './FinePlacement';
import { RoughPlacement } from './RoughPlacement';
import { FloorPlanPlacement } from './FloorPlanPlacement';

export {
    FloorPlanLayer,
    FloorControls,
    FloorPlanDialog,
    ImageOverlay,
    FinePlacement,
    RoughPlacement,
    FloorPlanPlacement
};

/**
 * Example Usage:
 * ```typescript
 * import { 
 *   FloorPlanLayer,
 *   FloorControls,
 *   FloorPlanDialog,
 *   ImageOverlay
 * } from './components/overlays';
 * 
 * <FloorPlanLayer
 *   mapRef={mapRef}
 *   selectedPropertyId={propertyId}
 * />
 * ```
 */
