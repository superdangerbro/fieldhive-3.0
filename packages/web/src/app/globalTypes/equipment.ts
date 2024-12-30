export interface Equipment {
    equipment_id: string;
    name: string;
    type: string;
    status: string;
    property_id: string;
    job_id: string;
    data?: Record<string, any>;
    created_at?: Date;
    updated_at?: Date;
    location: {
        coordinates: [number, number];
    };
}

export interface EquipmentType {
    name: string;
    label: string;
    fields: Field[];
    barcodeRequired?: boolean;
    photoRequired?: boolean;
}

export interface EquipmentStatus {
    name: string;    // Used as identifier
    label: string;   // Display name
    color: string;   // Status color
}

export interface CreateEquipmentDto {
    name: string;
    type: string;
    status?: string;
    property_id: string;
    job_id: string;
    data?: Record<string, any>;
    location: {
        coordinates: [number, number];
    };
}

export interface UpdateEquipmentDto {
    name?: string;
    type?: string;
    status?: string;
    data?: Record<string, any>;
}

export interface Field {
    name: string;
    type: 'text' | 'number-input' | 'number-stepper' | 'slider' | 'select' | 'boolean' | 'textarea';
    label?: string;
    required?: boolean;
    options?: string[];
    showWhen?: FieldCondition[];
    numberConfig?: {
        min?: number;
        max?: number;
        step?: number;
    };
}

export interface FieldCondition {
    field: string;
    value: any;
    makeRequired?: boolean;
}

export interface FormData {
    [key: string]: any;
}
