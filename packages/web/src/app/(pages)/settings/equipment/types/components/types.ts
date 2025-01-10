import type { EquipmentType } from '@/app/globalTypes/equipment';

export type FieldType = 'text' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'boolean' | 'slider' | 'capture-flow';

export interface NumberConfig {
    min?: number;
    max?: number;
    step?: number;
}

export interface SelectConfig {
    options: string[];
}

export interface MultiSelectConfig {
    options: string[];
}

export interface SliderConfig {
    min: number;
    max: number;
    step?: number;
    marks?: { value: number; label: string; }[];
}

export interface CaptureFlowConfig {
    requireBarcode: boolean;
    requirePhoto: boolean;
    barcodeFormats?: string[]; // Supported barcode formats
    photoInstructions?: string; // Optional instructions for taking the photo
}

export interface Condition {
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'greaterThanOrEqual' | 'lessThanOrEqual' | 'startsWith' | 'endsWith';
    value: string;
    targetFields: string[];
    action: 'show' | 'hide' | 'require' | 'notRequired' | 'enable' | 'disable';
}

export interface FormField {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    description?: string;
    conditions?: Condition[];  // Field-level conditions
    showWhen?: Condition[];   // Conditions that control field visibility
    config?: {
        requireBarcode?: boolean;
        requirePhoto?: boolean;
        photoInstructions?: string;
        options?: string[];
        [key: string]: any;
    };
}

export interface InspectionSection {
    title: string;
    fields: FormField[];
    description?: string;
    conditions?: Condition[];  // Section-level conditions
    showWhen?: Condition[];   // Conditions that control section visibility
}

export interface EquipmentTypeConfig {
    value: string;
    label: string;
    fields: FormField[];
    barcodeRequired?: boolean;
    photoRequired?: boolean;
    inspectionConfig?: {
        sections: InspectionSection[];
    };
}

// Type guards
export function isSelectConfig(config: NumberConfig | SelectConfig | MultiSelectConfig | SliderConfig | CaptureFlowConfig | undefined): config is SelectConfig {
    return config !== undefined && 'options' in config && !('min' in config);
}

export function isMultiSelectConfig(config: NumberConfig | SelectConfig | MultiSelectConfig | SliderConfig | CaptureFlowConfig | undefined): config is MultiSelectConfig {
    return config !== undefined && 'options' in config && !('min' in config);
}

export function isNumberConfig(config: NumberConfig | SelectConfig | MultiSelectConfig | SliderConfig | CaptureFlowConfig | undefined): config is NumberConfig {
    return config !== undefined && ('min' in config || 'max' in config || 'step' in config);
}

export function isSliderConfig(config: NumberConfig | SelectConfig | MultiSelectConfig | SliderConfig | CaptureFlowConfig | undefined): config is SliderConfig {
    return config !== undefined && 'marks' in config;
}

export function isCaptureFlowConfig(config: NumberConfig | SelectConfig | MultiSelectConfig | SliderConfig | CaptureFlowConfig | undefined): config is CaptureFlowConfig {
    return config !== undefined && 'requireBarcode' in config && 'requirePhoto' in config;
}
