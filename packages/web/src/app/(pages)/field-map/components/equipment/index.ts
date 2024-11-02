/**
 * Equipment-related components for the field map
 */

export * from './AddEquipmentDialog';
export * from './Crosshairs';
export * from './EquipmentLayer';
export * from './EquipmentMarkerDialog';
export * from './EquipmentPlacementControls';

/**
 * Example Usage:
 * ```typescript
 * import { 
 *   EquipmentLayer,
 *   AddEquipmentDialog,
 *   EquipmentMarkerDialog,
 *   EquipmentPlacementControls,
 *   Crosshairs
 * } from './components/equipment';
 * 
 * // Equipment layer
 * <EquipmentLayer
 *   visible={showEquipment}
 *   selectedPropertyId={propertyId}
 * />
 * 
 * // Equipment placement
 * {isPlacing && (
 *   <EquipmentPlacementControls
 *     onConfirm={handleConfirm}
 *     onCancel={handleCancel}
 *   />
 * )}
 * ```
 */
