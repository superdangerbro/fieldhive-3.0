/**
 * Health Domain Exports
 */

// Service
export { HealthService } from './services/healthService';

// Routes
export { default as healthRoutes } from './routes';

/**
 * Example Usage:
 * ```typescript
 * import { 
 *   HealthService,
 *   healthRoutes 
 * } from './domains/health';
 * 
 * // Use in Express app
 * app.use('/api/health', healthRoutes);
 * 
 * // Use service in other domains
 * const healthService = new HealthService();
 * const status = await healthService.getSystemStatus();
 * ```
 */
