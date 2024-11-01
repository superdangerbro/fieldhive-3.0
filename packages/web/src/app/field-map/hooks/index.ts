/**
 * Field map hooks
 * Centralizes map-related custom hooks
 */

export { useMapBounds } from './useMapBounds';
export { useOfflineSync } from './useOfflineSync';
export { useVisitWorkflow } from './useVisitWorkflow';

/**
 * Example Usage:
 * ```typescript
 * // Map bounds management
 * const { currentBounds, updateBounds, isInBounds } = useMapBounds(mapRef);
 * 
 * // Offline data sync
 * const { isOnline, saveOfflineData, loadOfflineData } = useOfflineSync({
 *   onSyncComplete: handleSyncComplete
 * });
 * 
 * // Visit workflow
 * const { currentTask, completeTask, progress } = useVisitWorkflow({
 *   visit: currentVisit,
 *   onVisitComplete: handleVisitComplete
 * });
 * ```
 */
