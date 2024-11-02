import { Sensor } from './entities/Sensor';

export interface CreateSensorDto {
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateSensorDto {
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface SensorResponse extends Sensor {
    sensor_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface SensorFilters {
    name?: string;
    isActive?: boolean;
}
