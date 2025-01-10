import { type FormField } from '../(pages)/settings/equipment/types/components/types';

export interface InspectionType {
    id: string;
    name: string;
    description?: string;
    fields: InspectionTypeField[];
    createdAt: string;
    updatedAt: string;
}

export interface InspectionTypeField extends Pick<FormField, 'name'> {
    required: boolean;
}

export interface Inspection {
    id: string;
    type: string;
    fields: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
