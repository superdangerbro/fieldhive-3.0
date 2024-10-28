import { useCallback } from 'react';
import { geocodeAddress } from '../utils/api';
import { PropertyFormData } from '../types';
import { Point } from 'geojson';

interface UsePropertyGeocodingProps {
  propertyData: PropertyFormData;
  setPropertyData: (data: PropertyFormData | ((prev: PropertyFormData) => PropertyFormData)) => void;
  lastLocation: React.MutableRefObject<[number, number] | null>;
}

export const usePropertyGeocoding = ({
  propertyData,
  setPropertyData,
  lastLocation,
}: UsePropertyGeocodingProps) => {
  const handleGeocodeAddress = useCallback(async (): Promise<boolean> => {
    const { serviceAddress } = propertyData;
    if (!serviceAddress.address1 || !serviceAddress.city || !serviceAddress.province) {
      return false;
    }

    const address = `${serviceAddress.address1}, ${serviceAddress.city}, ${serviceAddress.province}, ${serviceAddress.postalCode}`;
    
    try {
      const data = await geocodeAddress(address);
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        lastLocation.current = [lng, lat];
        
        // Ensure coordinates are numbers
        const point: Point = {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)]
        };

        console.log('Setting location:', point);

        setPropertyData((prev: PropertyFormData) => ({
          ...prev,
          location: point
        }));

        return true;
      } else {
        console.warn('No geocoding results found for address:', address);
        return false;
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      return false;
    }
  }, [propertyData, setPropertyData, lastLocation]);

  return {
    handleGeocodeAddress,
  };
};
