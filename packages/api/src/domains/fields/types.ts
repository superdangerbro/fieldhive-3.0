import { Field } from './entities/Field';

export interface CreateFieldDto {
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateFieldDto {
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface FieldResponse extends Field {
    field_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface FieldFilters {
    name?: string;
    isActive?: boolean;
}
