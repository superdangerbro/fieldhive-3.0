/**
 * Common components used across features
 */

export { Loading } from './Loading';
export { AddressForm } from './AddressForm';

/**
 * Example Usage:
 * ```typescript
 * import { Loading, AddressForm } from '../components/common';
 * 
 * // Loading state
 * {isLoading && <Loading />}
 * 
 * // Address form
 * <AddressForm
 *   initialAddress={address}
 *   onSubmit={handleAddressSubmit}
 *   onCancel={handleCancel}
 * />
 * ```
 */
