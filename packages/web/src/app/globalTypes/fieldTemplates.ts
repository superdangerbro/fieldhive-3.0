import type { FormField } from '../(pages)/settings/equipment/types/components/types';

export interface FieldSection {
    id: string;
    name: string;
    description?: string;
    fields: FormField[];
    createdAt: string;
    updatedAt: string;
}

// Field categories for organization
export const FIELD_SECTIONS = {
    EQUIPMENT: 'field_equipment', // Equipment-specific fields
    INSPECTIONS: 'inspections',   // Inspection-specific fields
    CUSTOM: 'custom'             // User-created fields
} as const;

// Common field names that should be standardized
export const STANDARD_FIELDS = {
    CAPTURE: {
        EQUIPMENT: 'equipment_capture',
        INSPECTION: 'inspection_capture'
    },
    LOCATION: {
        IS_INTERIOR: 'is_interior',
        FLOOR: 'floor'
    }
} as const;
