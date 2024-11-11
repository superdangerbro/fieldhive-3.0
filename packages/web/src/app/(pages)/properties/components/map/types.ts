import type { GeoJSONPolygon, GeoJSONPolygonOrNull } from '../../types/location';

export interface MapDialogProps {
  open: boolean;
  onClose: () => void;
  initialLocation: [number, number];  // [latitude, longitude]
  mode: 'marker' | 'polygon';
  onLocationSelect?: (coordinates: [number, number]) => void;  // Will return [latitude, longitude]
  onBoundarySelect?: (polygon: GeoJSONPolygonOrNull) => void;
  title?: string;
  initialBoundary?: GeoJSONPolygonOrNull;
}

export interface MapPolygonEditorProps {
  points: Array<[number, number]>;
  onPointsChange: (points: Array<[number, number]>) => void;
  themeColor: string;
  onError: (error: string | null) => void;
}

export interface MapMarkerEditorProps {
  location: [number, number];
  onLocationChange: (location: [number, number]) => void;
  themeColor: string;
  onError: (error: string | null) => void;
}

export interface MapControlsProps {
  mode: 'marker' | 'polygon';
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export interface PolygonHistory {
  points: Array<[number, number]>;
  index: number;
}
