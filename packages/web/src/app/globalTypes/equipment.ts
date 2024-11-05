export interface EquipmentStatus {
    value: string;
    label: string;
    color: string;
}

export interface EquipmentType {
    name: string;
    fields: any[]; // TODO: Define field types when needed
}

export interface Equipment {
    equipment_id: string;
    name: string;
    type: string;
    status: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface CreateEquipmentDto {
    name: string;
    type: string;
    status?: string;
}

export interface UpdateEquipmentDto {
    name?: string;
    type?: string;
    status?: string;
}
