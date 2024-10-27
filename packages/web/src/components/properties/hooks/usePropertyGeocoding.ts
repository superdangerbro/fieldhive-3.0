import { useCallback, useEffect } from 'react';
import { geocodeAddress } from '../utils/api';
import { PropertyFormData } from '../types';
import { Point } from 'geojson';

interface UsePropertyGeocodingProps {
  propertyData: PropertyFormData;
  setPropertyData: (data: PropertyFormData) => void;
  lastLocation: React.MutableRefObject<[number, number] | null>;
  activeStep: number;
}

export const usePropertyGeocoding = ({
  propertyData,
  setPropertyData,
  lastLocation,
  activeStep,
}: UsePropertyGeocodingProps) => {
  const handleGeocodeAddress = useCallback(async () => {
    const { serviceAddress } = propertyData;
    if (!serviceAddress.address1 || !serviceAddress.city || !serviceAddress.province) {
      return;
    }

    const address = `${serviceAddress.address1}, ${serviceAddress.city}, ${serviceAddress.province}, ${serviceAddress.postalCode}`;
    
    try {
      const data = await geocodeAddress(address);
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        lastLocation.current = [lng, lat];
        
        setPropertyData({
          ...propertyData,
          location: {
            type: 'Point',
            coordinates: [lng, lat],
          } as Point,
        });
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  }, [propertyData, setPropertyData, lastLocation]);

  // Effect to trigger geocoding when entering map step
  useEffect(() => {
    if (activeStep === 1) {
      handleGeocodeAddress();
    }
  }, [activeStep, handleGeocodeAddress]);

  return {
    handleGeocodeAddress,
  };
};
