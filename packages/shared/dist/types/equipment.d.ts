export interface Equipment {
    id: string;
    name: string;
    type: string;
    description?: string;
    status: 'active' | 'inactive' | 'maintenance';
    location?: {
        latitude: number;
        longitude: number;
    };
    lastMaintenance?: string;
    nextMaintenance?: string;
    properties: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
export interface EquipmentType {
    id: string;
    name: string;
    description?: string;
    properties: {
        name: string;
        type: 'string' | 'number' | 'boolean' | 'date';
        required: boolean;
        defaultValue?: any;
    }[];
    createdAt: string;
    updatedAt: string;
}
export interface EquipmentMaintenance {
    id: string;
    equipmentId: string;
    type: 'scheduled' | 'unscheduled';
    description: string;
    performedBy: string;
    performedAt: string;
    nextMaintenanceDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
export interface EquipmentStatus {
    id: string;
    equipmentId: string;
    status: Equipment['status'];
    reason?: string;
    changedBy: string;
    changedAt: string;
    createdAt: string;
    updatedAt: string;
}
export interface SpatialBounds {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
}
export interface RadialSearch {
    lat: number;
    lng: number;
    radiusMeters: number;
}
export interface NearbyEquipmentQuery {
    location?: {
        lat: number;
        lng: number;
    };
    maxDistance?: number;
    bounds?: SpatialBounds;
    radial?: RadialSearch;
    types?: string[];
    status?: Equipment['status'][];
    limit?: number;
    gridSize?: number;
}
export interface EquipmentCluster {
    id: string;
    count: number;
    center: {
        latitude: number;
        longitude: number;
    };
    bounds: SpatialBounds;
    equipment: Equipment[];
}
//# sourceMappingURL=equipment.d.ts.map