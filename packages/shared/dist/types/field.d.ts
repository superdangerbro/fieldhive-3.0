import { Point, Polygon } from 'geojson';
export declare enum FieldType {
    AGRICULTURAL = "agricultural",
    INDUSTRIAL = "industrial",
    COMMERCIAL = "commercial",
    RESIDENTIAL = "residential",
    CONSERVATION = "conservation"
}
export declare enum FieldStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    MAINTENANCE = "maintenance",
    MONITORING = "monitoring"
}
export interface Field {
    field_id: string;
    name: string;
    type: FieldType;
    status: FieldStatus;
    boundary: Polygon;
    center: Point;
    area: number;
    elevation?: number;
    property_id: string;
    created_at: Date;
    updated_at: Date;
    metadata?: Record<string, any>;
}
export interface FieldZone {
    zone_id: string;
    field_id: string;
    name: string;
    type: string;
    boundary: Polygon;
    area: number;
    metadata?: Record<string, any>;
}
export interface CreateFieldRequest {
    name: string;
    type: FieldType;
    boundary: Polygon;
    property_id: string;
    metadata?: Record<string, any>;
}
export interface UpdateFieldRequest {
    name?: string;
    type?: FieldType;
    status?: FieldStatus;
    boundary?: Polygon;
    metadata?: Record<string, any>;
}
export interface FieldResponse {
    success: boolean;
    data: Field;
}
export interface FieldsResponse {
    success: boolean;
    data: Field[];
}
export interface FieldStats {
    total_area: number;
    equipment_count: number;
    sensor_count: number;
    active_alerts: number;
    last_inspection?: Date;
}
export interface FieldWithStats extends Field {
    stats: FieldStats;
}
export interface FieldActivity {
    activity_id: string;
    field_id: string;
    type: string;
    description: string;
    start_time: Date;
    end_time?: Date;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    equipment_ids?: string[];
    sensor_ids?: string[];
    metadata?: Record<string, any>;
}
export interface FieldSpatialQuery {
    bounds?: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
    center?: Point;
    radius?: number;
    types?: FieldType[];
    status?: FieldStatus[];
}
export interface FieldCluster {
    center: Point;
    count: number;
    total_area: number;
    field_ids: string[];
    bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
}
//# sourceMappingURL=field.d.ts.map