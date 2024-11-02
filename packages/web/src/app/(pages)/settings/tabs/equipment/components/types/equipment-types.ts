export interface NumberConfig {
    min?: number;
    max?: number;
    step?: number;
}

export interface Condition {
    field: string;
    value: any;
    makeRequired?: boolean;
}

export interface FormField {
    name: string;
    type: string;
    required: boolean;
    options?: string[];
    numberConfig?: NumberConfig;
    showWhen?: Condition[];
}

export interface EquipmentTypeConfig {
    name: string;
    fields: FormField[];
}

export interface NewFieldState {
    name: string;
    type: string;
    required: boolean;
    options: string[];
    newOption: string;
    numberConfig: NumberConfig;
}
