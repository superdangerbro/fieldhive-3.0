export interface Equipment {
    equipment_id: string;
    name: string;
    type: string;
    status: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface EquipmentType {
    value: string;
    label: string;
    fields?: any[]; // For rules and conditions
}

export interface EquipmentStatus {
    value: string;    // Used as identifier
    label: string;    // Display name
    color: string;    // Status color
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
