import { BaseStatusConfig } from '@fieldhive/shared';

export interface JobStatusConfig extends BaseStatusConfig {}

export interface EditingStatus {
    index: number;
    value: JobStatusConfig;
}

// Re-export shared types for convenience
export type { BaseStatusConfig as StatusConfig };
