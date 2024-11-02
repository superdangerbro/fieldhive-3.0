import { Equipment } from './entities/Equipment';

export type EquipmentType = 'Type1' | 'Type2' | 'Type3';

export interface CreateEquipmentDto {
    name: string;
    type: EquipmentType;
    description?: string;
    status?: 'active' | 'inactive' | 'maintenance';
}

export interface UpdateEquipmentDto {
    name?: string;
    type?: EquipmentType;
    description?: string;
    status?: 'active' | 'inactive' | 'maintenance';
}

export interface EquipmentResponse extends Equipment {
    equipment_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface EquipmentFilters {
    type?: EquipmentType;
    status?: 'active' | 'inactive' | 'maintenance';
    name?: string;
}

// For eager loading relationships
export interface EquipmentWithRelations extends Equipment {
    // Define any relationships if needed
}
