import { Account, Property } from '@fieldhive/shared';
import { Contact } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function createAccount(name: string, contacts: Contact[]) {
  const response = await fetch(`${API_BASE_URL}/api/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      contacts: contacts.map(contact => ({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        role: contact.role,
        isPrimary: contact.isPrimary,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create account: ${error}`);
  }

  return response.json() as Promise<Account>;
}

export async function createProperty(data: any, accountId: string) {
  const response = await fetch(`${API_BASE_URL}/api/properties`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      accountId,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create property: ${error}`);
  }

  return response.json() as Promise<Property>;
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
