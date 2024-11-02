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
