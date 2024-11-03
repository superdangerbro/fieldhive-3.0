export interface CreateEquipmentDto {
    name: string;
    description?: string;
    type: string;
    status?: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    data?: Record<string, any>;
}

export interface UpdateEquipmentDto {
    name?: string;
    description?: string;
    type?: string;
    status?: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    data?: Record<string, any>;
}

export interface EquipmentFilters {
    type?: string;
    status?: string;
    name?: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
        radius: number; // in meters
    };
}
