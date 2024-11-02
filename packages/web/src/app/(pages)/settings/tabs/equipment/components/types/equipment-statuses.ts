import { EquipmentStatusConfig, StatusColor } from '@fieldhive/shared';

export interface EquipmentStatusSettings {
    statuses: EquipmentStatusConfig[];
}

export interface EditingStatus {
    index: number;
    value: EquipmentStatusConfig;
}

// Re-export shared types for convenience
export type { EquipmentStatusConfig, StatusColor };
