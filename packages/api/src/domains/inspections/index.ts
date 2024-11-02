/**
 * Inspections Domain Exports
 */

// Entity
export { Inspection } from './entities/Inspection';

// Types
export {
    InspectionStatus,
    CreateInspectionDto,
    UpdateInspectionDto,
    InspectionResponse,
    InspectionFilters,
    InspectionWithRelations
} from './types';

// Service
export { InspectionService } from './services/inspectionService';

// Routes
export { default as inspectionRoutes } from './routes';

/**
 * Example Usage:
 * ```typescript
 * import { 
 *   Inspection,
 *   InspectionService,
 *   CreateInspectionDto,
 *   inspectionRoutes 
 * } from './domains/inspections';
 * 
 * // Use in Express app
 * app.use('/api/inspections', inspectionRoutes);
 * 
 * // Use service in other domains
 * const inspectionService = new InspectionService();
 * const inspection = await inspectionService.findById(id);
 * ```
 */
