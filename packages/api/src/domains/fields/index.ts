/**
 * Field Domain Exports
 */

// Entity
export { Field } from './entities/Field';

// Types
export {
    CreateFieldDto,
    UpdateFieldDto,
    FieldResponse,
    FieldFilters
} from './types';

// Service
export { FieldService } from './services/fieldService';

// Routes
export { default as fieldRoutes } from './routes';

/**
 * Example Usage:
 * ```typescript
 * import { 
 *   Field,
 *   FieldService,
 *   CreateFieldDto,
 *   fieldRoutes 
 * } from './domains/fields';
 * 
 * // Use in Express app
 * app.use('/api/fields', fieldRoutes);
 * 
 * // Use service in other domains
 * const fieldService = new FieldService();
 * const field = await fieldService.findById(id);
 * ```
 */
