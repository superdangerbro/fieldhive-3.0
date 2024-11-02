/**
 * Equipment-related components for the field map
 */

import EquipmentLayer from './EquipmentLayer';
import { EquipmentPlacementControls } from './EquipmentPlacementControls';

export {
    EquipmentLayer,
    EquipmentPlacementControls
};

/**
 * Example Usage:
 * ```typescript
 * import { EquipmentLayer, EquipmentPlacementControls } from './components/equipment';
 * 
 * <EquipmentLayer
 *   visible={showEquipment}
 *   selectedPropertyId={propertyId}
 * />
 * 
 * <EquipmentPlacementControls
 *   onConfirm={handlePlacementConfirm}
 *   onCancel={handlePlacementCancel}
 * />
 * ```
 */
