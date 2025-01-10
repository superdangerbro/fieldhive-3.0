import { Point } from 'geojson';
import { Job } from './job';
import { Property } from './property';
import { type FormField } from '../(pages)/settings/equipment/types/components/types';

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
    location: Point;
    job?: Job;
    property?: Property;
    inspections?: EquipmentInspection[];
    fields: Record<string, any>;
}

export interface EquipmentInspection {
    inspection_id: string;
    equipment_id: string;
    inspector_id: string;
    property_id?: string;
    job_id?: string;
    barcode?: string;
    notes?: string;
    image_url?: string;
    data?: Record<string, any>;
    location?: Point;
    created_at: string;
    updated_at: string;
}

export interface EquipmentType {
    id: string;
    name: string;
    label: string;
    description?: string;
    fields: EquipmentTypeField[];
    barcodeRequired?: boolean;
    photoRequired?: boolean;
}

export interface EquipmentTypeField extends Pick<FormField, 'name'> {
    required: boolean;
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
    location: Point;
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
