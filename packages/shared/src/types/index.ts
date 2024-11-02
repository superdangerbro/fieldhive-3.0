// Export all types
export * from './property';
export * from './job';
export * from './address';
export * from './account';

// Export status types
export {
  StatusColor,
  StatusConfig,
  AccountStatus,
  JobStatus,
  EquipmentStatus,
  StatusSettings
} from './status';

// Geospatial Types
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // Array of linear rings
}

// Dashboard Data Types
export interface DashboardMetrics {
  id: string;
  timestamp: string;
  value: number;
  location?: GeoPoint;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'map' | 'metric' | 'table';
  title: string;
  data: DashboardMetrics[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// WebSocket Event Types
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

// User Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  preferences: {
    dashboardLayout?: string;
    theme?: 'light' | 'dark';
  };
}

// Database Models
export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Field extends BaseModel {
  name: string;
  boundary: GeoPolygon;
  area: number; // in hectares
  status: 'active' | 'inactive';
}

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

// Real-time Dashboard Configuration
export interface DashboardConfig {
  id: string;
  name: string;
  layout: {
    widgets: Array<{
      id: string;
      type: DashboardWidget['type'];
      position: { x: number; y: number; w: number; h: number };
      settings: Record<string, unknown>;
    }>;
  };
  refreshInterval: number; // in seconds
  autoRefresh: boolean;
}
