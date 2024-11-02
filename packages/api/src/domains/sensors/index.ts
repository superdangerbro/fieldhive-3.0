/**
 * Sensor Domain Exports
 */

// Entity
export { Sensor } from './entities/Sensor';

// Types
export {
    CreateSensorDto,
    UpdateSensorDto,
    SensorResponse,
    SensorFilters
} from './types';

// Service
export { SensorService } from './services/sensorService';

// Routes
export { default as sensorRoutes } from './routes';

/**
 * Example Usage:
 * ```typescript
 * import { 
 *   Sensor,
 *   SensorService,
 *   CreateSensorDto,
 *   sensorRoutes 
 * } from './domains/sensors';
 * 
 * // Use in Express app
 * app.use('/api/sensors', sensorRoutes);
 * 
 * // Use service in other domains
 * const sensorService = new SensorService();
 * const sensor = await sensorService.findById(id);
 * ```
 */
