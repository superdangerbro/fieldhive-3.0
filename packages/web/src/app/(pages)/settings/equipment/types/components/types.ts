import type { EquipmentType } from '@/app/globalTypes/equipment';

export type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'textarea';

export interface NumberConfig {
    min?: number;
    max?: number;
    step?: number;
}

export interface SelectConfig {
    options: string[];
    multiple?: boolean;
}

export interface Condition {
    field: string;        // Field name this condition depends on
    value: string | boolean;  // Value that triggers the condition
    makeRequired?: boolean;  // Whether this field becomes required when condition is met
}

export interface FormField {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    conditions?: Condition[];
    config?: NumberConfig | SelectConfig;
    description?: string;
}

export interface InspectionSection {
    title: string;
    description?: string;
    fields: FormField[];
    conditions?: Condition[]; // Section-level conditions
}

// Extend the global EquipmentType interface
export interface EquipmentTypeConfig extends EquipmentType {
    fields: FormField[];  // Equipment fields
    barcodeRequired: boolean; // Whether this equipment type requires a barcode
    photoRequired: boolean; // Whether this equipment type requires a photo
    inspectionConfig?: {
        sections: InspectionSection[];
    };
}

export interface NewFieldState extends Omit<FormField, 'name'> {
    name: string;
}

// Type guards
export function isSelectConfig(config: NumberConfig | SelectConfig | undefined): config is SelectConfig {
    return config !== undefined && 'options' in config;
}

export function isNumberConfig(config: NumberConfig | SelectConfig | undefined): config is NumberConfig {
    return config !== undefined && ('min' in config || 'max' in config || 'step' in config);
}
