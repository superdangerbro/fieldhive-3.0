'use client';

import React from 'react';
import { Marker } from 'react-map-gl';
import { keyframes } from '@mui/system';

interface UserLocationMarkerProps {
  /** User's longitude */
  longitude: number;
  /** User's latitude */
  latitude: number;
  /** User's heading in degrees (optional) */
  heading?: number | null;
  /** Whether location tracking is active */
  isTracking: boolean;
}

// Animation for the pulsing effect
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(2.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Animation for the glowing effect
const glow = keyframes`
  0% {
    box-shadow: 0 0 10px 2px rgba(37, 99, 235, 0.8);
  }
  50% {
    box-shadow: 0 0 20px 4px rgba(37, 99, 235, 0.4);
  }
  100% {
    box-shadow: 0 0 10px 2px rgba(37, 99, 235, 0.8);
  }
`;

/**
 * Marker showing user's current location on the map
 * Features:
 * - Pulsing animation when tracking
 * - Glowing effect when active
 * - Direction indicator (when heading available)
 * - Smooth animations
 * 
 * @component
 * @example
 * ```tsx
 * <UserLocationMarker
 *   longitude={userLng}
 *   latitude={userLat}
 *   heading={deviceHeading}
 *   isTracking={isLocationTracking}
 * />
 * ```
 */
export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ 
  longitude, 
  latitude, 
  heading, 
  isTracking 
}) => {
  return (
    <Marker longitude={longitude} latitude={latitude}>
      <div
        style={{
          position: 'relative',
          width: 12,
          height: 12,
        }}
      >
        {/* Pulsing effect when tracking */}
        {isTracking && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              background: '#2563eb',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              opacity: 0.4,
            }}
          />
        )}

        {/* Main location dot */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            background: '#2563eb',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            animation: isTracking ? `${glow} 2s ease-in-out infinite` : 'none',
            zIndex: 2,
          }}
        />
        
        {/* Direction indicator */}
        {typeof heading === 'number' && (
          <div
            style={{
              position: 'absolute',
              top: -10,
              left: '50%',
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderBottom: '10px solid #2563eb',
              transform: `translate(-50%, 0) rotate(${heading}deg)`,
              transformOrigin: 'bottom',
              filter: 'drop-shadow(0 0 2px rgba(37, 99, 235, 0.5))',
              zIndex: 1,
            }}
          />
        )}
      </div>
    </Marker>
  );
};
