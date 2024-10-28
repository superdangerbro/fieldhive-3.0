import { Account, Property, CreateAccountDto, CreatePropertyRequest } from '@fieldhive/shared';
import { Contact } from '../components/properties/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AccountsResponse {
  accounts: Account[];
  total: number;
}

interface PropertiesResponse {
  properties: Property[];
  total: number;
}

export async function getAccounts(): Promise<AccountsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/accounts`);
    if (!response.ok) {
      throw new Error('Failed to fetch accounts');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return { accounts: [], total: 0 };
  }
}

export async function getProperties(page: number, pageSize: number): Promise<PropertiesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/properties?page=${page}&pageSize=${pageSize}`);
    if (!response.ok) {
      throw new Error('Failed to fetch properties');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching properties:', error);
    return { properties: [], total: 0 };
  }
}

export async function createAccount(accountData: CreateAccountDto): Promise<Account> {
  const response = await fetch(`${API_BASE_URL}/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(accountData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create account: ${error}`);
  }

  return response.json();
}

export async function createProperty(data: CreatePropertyRequest): Promise<Property> {
  console.log('API createProperty payload:', JSON.stringify(data, null, 2));
  
  const response = await fetch(`${API_BASE_URL}/properties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create property error response:', errorText);
    throw new Error(`Failed to create property: ${errorText}`);
  }

  return response.json();
}

export async function geocodeAddress(address: string) {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!MAPBOX_TOKEN) {
    throw new Error('MAPBOX_TOKEN not found');
  }

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${MAPBOX_TOKEN}&country=CA`
  );

  if (!response.ok) {
    throw new Error('Geocoding failed');
  }

  return response.json();
}
