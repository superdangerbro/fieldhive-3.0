/**
 * Property Domain Exports
 */

// Entity
export { Property } from './entities/Property';

// Types
export {
    PropertyType,
    PropertyStatus,
    CreatePropertyDto,
    UpdatePropertyDto,
    PropertyResponse,
    PropertyFilters,
    PropertyWithRelations
} from './types';

// Service
export { PropertyService } from './services/propertyService';

// Routes
export { default as propertyRoutes } from './routes';

/**
 * Example Usage:
 * ```typescript
 * import { 
 *   Property,
 *   PropertyService,
 *   CreatePropertyDto,
 *   propertyRoutes 
 * } from './domains/properties';
 * 
 * // Use in Express app
 * app.use('/api/properties', propertyRoutes);
 * 
 * // Use service in other domains
 * const propertyService = new PropertyService();
 * const property = await propertyService.findById(id);
 * ```
 */
