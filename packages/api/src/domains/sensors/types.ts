import { BaseModel, GeoPoint } from '../../core/types';

export interface Sensor extends BaseModel {
    deviceId: string;
    type: 'soil' | 'weather' | 'irrigation';
    location: GeoPoint;
    lastReading: Date;
    status: 'online' | 'offline' | 'maintenance';
}

export interface SensorReading extends BaseModel {
    sensorId: string;
    type: string;
    value: number;
    unit: string;
    timestamp: Date;
    location: GeoPoint;
}
