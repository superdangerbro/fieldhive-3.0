/**
 * Property-related components
 */

// Main components
export * from './AccountSelector';
export * from './AddPropertyDialog';
export * from './EditPropertyDialog';
export * from './LocationPickerDialog';
export * from './MapDialog';
export * from './PropertiesHeader';
export * from './PropertiesTable';
export * from './PropertyAddresses';
export * from './PropertyDetails';
export * from './PropertyHeader';
export * from './PropertyLocation';
export * from './PropertyMetadata';
export * from './PropertySearch';
export * from './PropertyStatus';
export * from './PropertyTabs';

// Add property dialog components
export * from './AddPropertyDialog/StepContent';

// Property creation steps
export * from './steps/AccountStep';
export * from './steps/AddressFormStep';
export * from './steps/BoundaryStep';
export * from './steps/ContactsStep';
export * from './steps/LocationStep';

/**
 * Example Usage:
 * ```typescript
 * import {
 *   PropertyDetails,
 *   PropertyLocation,
 *   AddPropertyDialog,
 *   PropertySearch
 * } from './components';
 * 
 * // Property details
 * <PropertyDetails
 *   property={selectedProperty}
 *   onEdit={handleEdit}
 * />
 * 
 * // Property creation
 * <AddPropertyDialog
 *   open={isAddDialogOpen}
 *   onClose={handleClose}
 *   onSubmit={handleSubmit}
 * />
 * ```
 */
