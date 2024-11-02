import { PropertiesApi } from './domains/properties';
import { AccountsApi } from './domains/accounts';
import { JobsApi } from './domains/jobs';
import { SettingsApi } from './domains/settings';
import { AddressesApi } from './domains/addresses';

// Create instances
const propertiesApi = new PropertiesApi();
const accountsApi = new AccountsApi();
const jobsApi = new JobsApi();
const settingsApi = new SettingsApi();
const addressesApi = new AddressesApi();

// Export domain-specific APIs
export const api = {
    properties: propertiesApi,
    accounts: accountsApi,
    jobs: jobsApi,
    settings: settingsApi,
    addresses: addressesApi,
};

// Export individual methods for backward compatibility
export const {
    // Properties
    getProperties,
    getPropertiesInBounds,
    createProperty,
    updateProperty,
    deleteProperty,
    archiveProperty,
    getPropertyAccounts,
    getPropertyLocation,
    getPropertyAddresses,
    updatePropertyMetadata,
} = propertiesApi;

export const {
    // Accounts
    getAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    archiveAccount,
} = accountsApi;

export const {
    // Jobs
    getJobs,
    getJobTypes,
    createJob,
    updateJob,
    deleteJob,
} = jobsApi;

export const {
    // Settings
    getSetting,
    updateSetting,
    getEquipmentTypes,
    saveEquipmentTypes,
    getEquipmentStatuses,
    saveEquipmentStatuses,
} = settingsApi;

export const {
    // Addresses
    getAddress,
    createAddress,
    updateAddress,
} = addressesApi;
