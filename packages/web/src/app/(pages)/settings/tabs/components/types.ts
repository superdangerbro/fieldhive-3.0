export interface EquipmentTypeConfig {
    name: string;
    fields: FormField[];
}

export interface FormField {
    name: string;
    type: string;
    required: boolean;
    options?: string[];
    numberConfig?: {
        min?: number;
        max?: number;
        step?: number;
    };
    showWhen?: Array<{
        field: string;
        value: any;
        makeRequired?: boolean;
    }>;
}

export interface NewFieldState {
    name: string;
    type: string;
    required: boolean;
    options: string[];
    newOption: string;
    numberConfig: {
        min?: number;
        max?: number;
        step?: number;
    };
}
