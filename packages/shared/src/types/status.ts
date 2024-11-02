// Common status color type used across domains
export type StatusColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

// Base status configuration used by all domains
export interface StatusConfig {
    value: string;
    label: string;
    color: StatusColor;
}

// Domain-specific status types (all use same structure)
export type AccountStatus = StatusConfig;
export type JobStatus = StatusConfig;
export type EquipmentStatus = StatusConfig;

// Settings response types
export interface StatusSettings {
    statuses: StatusConfig[];
}

// Re-export for convenience
export type { StatusColor as StatusColorType };
export type { StatusConfig as StatusConfigType };
export type { StatusSettings as StatusSettingsType };
