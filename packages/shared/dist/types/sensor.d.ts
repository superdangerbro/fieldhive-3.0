import { Point } from 'geojson';
export declare enum SensorType {
    TEMPERATURE = "temperature",
    HUMIDITY = "humidity",
    MOTION = "motion",
    PRESSURE = "pressure",
    WATER_LEVEL = "water_level",
    SOIL_MOISTURE = "soil_moisture"
}
export interface Sensor {
    sensor_id: string;
    name: string;
    type: SensorType;
    location?: Point;
    equipment_id?: string;
    field_id?: string;
    status: 'active' | 'inactive' | 'maintenance';
    battery_level?: number;
    firmware_version?: string;
    last_reading_at?: Date;
    created_at: Date;
    updated_at: Date;
    metadata?: Record<string, any>;
}
export interface SensorReading {
    reading_id: string;
    sensor_id: string;
    type: SensorType;
    value: number;
    unit: string;
    timestamp: Date;
    location?: Point;
    quality?: number;
    metadata?: Record<string, any>;
}
export interface CreateSensorRequest {
    name: string;
    type: SensorType;
    location?: Point;
    equipment_id?: string;
    field_id?: string;
    metadata?: Record<string, any>;
}
export interface UpdateSensorRequest {
    name?: string;
    location?: Point;
    equipment_id?: string;
    field_id?: string;
    status?: 'active' | 'inactive' | 'maintenance';
    metadata?: Record<string, any>;
}
export interface SensorResponse {
    success: boolean;
    data: Sensor;
}
export interface SensorsResponse {
    success: boolean;
    data: Sensor[];
}
export interface SensorReadingResponse {
    success: boolean;
    data: SensorReading;
}
export interface SensorReadingsResponse {
    success: boolean;
    data: SensorReading[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
    };
}
export interface SensorAlert {
    alert_id: string;
    sensor_id: string;
    type: 'threshold' | 'malfunction' | 'battery' | 'connection';
    severity: 'low' | 'medium' | 'high';
    message: string;
    reading_id?: string;
    created_at: Date;
    resolved_at?: Date;
    metadata?: Record<string, any>;
}
