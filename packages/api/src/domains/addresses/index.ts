/**
 * Address Domain Exports
 */

// Entity
export { Address } from './entities/Address';

// Types
export {
    CreateAddressDto,
    UpdateAddressDto,
    AddressResponse,
    AddressFilters
} from './types';

// Service
export { AddressService } from './services/addressService';

// Routes
export { default as addressRoutes } from './routes';

/**
 * Example Usage:
 * ```typescript
 * import { 
 *   Address,
 *   AddressService,
 *   CreateAddressDto,
 *   addressRoutes 
 * } from './domains/addresses';
 * 
 * // Use in Express app
 * app.use('/api/addresses', addressRoutes);
 * 
 * // Use service in other domains
 * const addressService = new AddressService();
 * const address = await addressService.findById(id);
 * ```
 */
