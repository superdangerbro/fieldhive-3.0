import type { PointLocation } from '../field-map/types';

export interface EquipmentType {
  name: string;
  fields: Field[];
}

export interface Equipment {
  equipment_id: string;
  equipment_type_id: string;
  location: PointLocation;
  status: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  equipment_type: EquipmentType;
}

export interface EquipmentFormData {
  equipment_type_id: string;
  status: string;
  data: Record<string, any>;
}

export interface Field {
  name: string;
  type: string;
  required: boolean;
  options?: string[];
  numberConfig?: {
    min?: number;
    max?: number;
    step?: number;
  };
  showWhen?: FieldCondition[];
}

export interface FieldCondition {
  field: string;
  value: any;
  makeRequired?: boolean;
}

export interface FormData {
  [key: string]: any;
}
