export interface PropertyLocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface PropertyBoundary {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties: {
    property_id: string;
    property_type: string;
    status: string;
  };
}

export interface PropertyWithLocation {
  property_id: string;
  name: string;
  type: string;
  status: string;
  service_address_id: string | null;
  billing_address_id: string | null;
  created_at: Date;
  updated_at: Date;
  location: PropertyLocation;
  boundary?: PropertyBoundary;
}

export interface Property {
  property_id: string;
  name: string;
  type: string;
  status: string;
  service_address_id: string | null;
  billing_address_id: string | null;
  created_at: Date;
  updated_at: Date;
  location: {
    coordinates: [number, number];
  };
  boundary?: {
    geometry: {
      coordinates: number[][][];
    };
  };
  serviceAddress?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    address_id: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    address_id: string;
  };
  accounts?: Array<{
    account_id: string;
    name: string;
    type: string;
    status: string;
  }>;
}
