/**
 * Settings Domain Exports
 */

// Entity
export { Setting } from './entities/Setting';

// Types
export {
    CreateSettingDto,
    UpdateSettingDto,
    SettingResponse,
    SettingFilters
} from './types';

// Service
export { SettingService } from './services/settingService';

// Routes
export { default as settingRoutes } from './routes';

/**
 * Example Usage:
 * ```typescript
 * import { 
 *   Setting,
 *   SettingService,
 *   CreateSettingDto,
 *   settingRoutes 
 * } from './domains/settings';
 * 
 * // Use in Express app
 * app.use('/api/settings', settingRoutes);
 * 
 * // Use service in other domains
 * const settingService = new SettingService();
 * const setting = await settingService.findById(id);
 * ```
 */
