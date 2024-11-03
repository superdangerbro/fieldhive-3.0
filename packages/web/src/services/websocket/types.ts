export enum WebSocketEventType {
    METRICS_UPDATE = 'METRICS_UPDATE',
    LOCATION_UPDATE = 'LOCATION_UPDATE',
    ALERT = 'ALERT'
}

export interface WebSocketEvent<T> {
    type: WebSocketEventType;
    payload: T;
    timestamp: string;
}
