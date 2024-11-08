import type { Property } from '@/app/globalTypes/property';

export interface MapProperty extends Omit<Property, 'location'> {
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface FloorPlan {
  id: string;
  name: string;
  visible: boolean;
  imageUrl: string;
  floor: number;
  propertyId: string;
}
