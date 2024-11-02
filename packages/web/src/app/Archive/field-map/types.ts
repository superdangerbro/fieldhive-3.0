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

export interface SelectedProperty {
  id: string;
  name: string;
  location: StandardLocation;
}

/**
 * Equipment Types
 */

export interface Equipment {
  equipment_id: string;
  equipment_type_id: string;
  location: PointLocation;
  status: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
  equipment_type: EquipmentType;
}

export interface EquipmentType {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    options?: string[];
    numberConfig?: {
      min?: number;
      max?: number;
      step?: number;
    };
    showWhen?: Array<{
      field: string;
      value: any;
      makeRequired?: boolean;
    }>;
  }>;
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
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
    coordinates: [number, number][];
  };
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
 * Store Types
 */

export interface MapStore {
  viewState: MapViewState;
  selectedProperty: SelectedProperty | null;
  properties: MapProperty[];
  floorPlans: FloorPlan[];
  activeFloorPlan: string | null;
}

export interface EquipmentStoreState {
  equipment: Equipment[];
  equipmentTypes: EquipmentType[];
  selectedEquipment: Equipment | null;
  isPlacingEquipment: boolean;
  placementLocation: [number, number] | null;
  currentBounds: BoundsArray | null;
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
