import type { ViewState, PaddingOptions } from 'react-map-gl';
import type { Property, PropertyType, PropertyStatus } from '@fieldhive/shared';

/**
 * Property Types
 */

// Base location types
export interface PointLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface StandardLocation {
  longitude: number;
  latitude: number;
}

// Job statistics type
export interface JobStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  latest?: {
    title: string;
    status: string;
    created_at: string;
  };
}

// Map-specific property type that extends the shared Property type
export interface MapProperty extends Omit<Property, 'location'> {
  property_id: string;
  name: string;
  property_type: PropertyType;
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
  location: PointLocation;
  boundary?: {
    type: string;
    coordinates: [number, number][][];
  };
  billing_address_id?: string;
  service_address_id?: string;
  accounts?: Array<{
    account_id: string;
    name: string;
    role?: string;
  }>;
  job_stats?: JobStats;
}

/**
 * Floor Plan Types
 */

export interface FloorPlan {
  id: string;
  name: string;
  visible: boolean;
  imageUrl: string;
  floor: number;
  propertyId: string;
  bounds?: FloorPlanBounds;
}

export interface FloorPlanBounds {
  west: number;
  east: number;
  north: number;
  south: number;
  coordinates: [number, number][];
}

/**
 * Visit Types
 */

export interface Task {
  id: string;
  type: 'inspect' | 'install' | 'service' | 'repair';
  equipment_id?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  required: boolean;
  description: string;
  notes?: string;
  location?: PointLocation;
  checklist?: Array<{
    id: string;
    description: string;
    completed: boolean;
    required: boolean;
  }>;
}

export interface Visit {
  visit_id: string;
  job_id: string;
  type: 'quote' | 'setup' | 'service' | 'inspection' | 'close';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_start: string;
  scheduled_end: string;
  tasks: Task[];
  property_id: string;
}

/**
 * Map State Types
 */

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export type BoundsArray = [number, number, number, number]; // [west, south, east, north]

export interface MapViewState extends Omit<ViewState, 'padding'> {
  padding?: PaddingOptions;
}

/**
 * Component Props Types
 */

export interface MarkerProps {
  longitude: number;
  latitude: number;
  onClick?: () => void;
}

export interface LayerProps {
  visible?: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export interface ControlProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  style?: React.CSSProperties;
}

/**
 * Event Types
 */

export interface MapMoveEvent {
  viewState: MapViewState;
  target: any;
  originalEvent: MouseEvent | TouchEvent | WheelEvent;
}

export interface MarkerDragEvent {
  lngLat: [number, number];
  target: any;
  originalEvent: MouseEvent | TouchEvent;
}

/**
 * Utility Types
 */

export type Coordinates = [number, number]; // [longitude, latitude]

export interface GeoJsonPoint {
  type: 'Point';
  coordinates: Coordinates;
}

export type LoadingState = 'idle' | 'loading' | 'error' | 'success';
