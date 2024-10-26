import { DashboardMetrics } from './dashboard';
import { Equipment } from './equipment';
import { Sensor } from './sensor';

export type WebSocketMessageType = 
    | 'connection'
    | 'METRICS_UPDATE'
    | 'EQUIPMENT_UPDATE'
    | 'SENSOR_UPDATE'
    | 'ERROR'
    | 'ping'
    | 'pong';

export interface WebSocketMessage<T = any> {
    type: WebSocketMessageType;
    payload?: T;
    data?: T;  // For backward compatibility
    timestamp: string;
}

export interface MetricsUpdateMessage extends WebSocketMessage<{
    metrics: DashboardMetrics;
}> {
    type: 'METRICS_UPDATE';
}

export interface EquipmentUpdateMessage extends WebSocketMessage<{
    equipment: Equipment;
}> {
    type: 'EQUIPMENT_UPDATE';
}

export interface SensorUpdateMessage extends WebSocketMessage<{
    sensor: Sensor;
}> {
    type: 'SENSOR_UPDATE';
}

export interface ErrorMessage extends WebSocketMessage<{
    code: string;
    message: string;
}> {
    type: 'ERROR';
}

export interface ConnectionMessage extends WebSocketMessage<{
    clientId: string;
    status: 'connected' | 'disconnected';
}> {
    type: 'connection';
}

export interface PingMessage extends WebSocketMessage {
    type: 'ping';
}

export interface PongMessage extends WebSocketMessage<{
    latency: number;
}> {
    type: 'pong';
}

export type WebSocketResponse = 
    | MetricsUpdateMessage
    | EquipmentUpdateMessage
    | SensorUpdateMessage
    | ErrorMessage
    | ConnectionMessage
    | PingMessage
    | PongMessage;
