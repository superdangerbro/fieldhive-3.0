/**
 * Equipment Domain Exports
 */

// Entity
export { Equipment } from './entities/Equipment';

// Types
export {
    EquipmentType,
    CreateEquipmentDto,
    UpdateEquipmentDto,
    EquipmentResponse,
    EquipmentFilters
} from './types';

// Service
export { EquipmentService } from './services/equipmentService';

// Routes
export { default as equipmentRoutes } from './routes';

/**
 * Example Usage:
 * ```typescript
 * import { 
 *   Equipment,
 *   EquipmentService,
 *   CreateEquipmentDto,
 *   equipmentRoutes 
 * } from './domains/equipment';
 * 
 * // Use in Express app
 * app.use('/api/equipment', equipmentRoutes);
 * 
 * // Use service in other domains
 * const equipmentService = new EquipmentService();
 * const equipment = await equipmentService.findById(id);
 * ```
 */
