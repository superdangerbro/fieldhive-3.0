import { Point, Polygon } from 'geojson';
import { PropertyType } from '@fieldhive/shared/src/types/property';

export interface AddressFields {
  address1: string;
  address2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface Account {
  account_id: string;
  name: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isPrimary: boolean;
}

export interface PropertyFormData {
  useCustomName: boolean;
  customName: string;
  serviceAddress: AddressFields;
  useDifferentBillingAddress: boolean;
  billingAddress: AddressFields;
  boundary: Polygon | null;
  location: Point | null;
  type: PropertyType;
}
