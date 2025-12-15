'use client';

import { GoogleMap, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { useCallback, useState } from 'react';
import { House } from '@/types/house';
import HouseMarker from './HouseMarker';

interface ChristmasMapProps {
  houses: House[];
  selectedHouse: string | null;
  onSelectHouse: (id: string) => void;
  directions: google.maps.DirectionsResult[];
  userLocation: { lat: number; lng: number } | null;
  showStopNumbers?: boolean;
}

// Beautiful dark Christmas-themed map style
const mapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b9dc3' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#3d5a80' }],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#16213e' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#1f4068' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7280' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [{ color: '#0f3d3e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2d3a4f' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3d5a80' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1f4068' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0d1b2a' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4a5568' }],
  },
];

const defaultCenter = { lat: 39.8283, lng: -98.5795 }; // Center of USA

export default function ChristmasMap({
  houses,
  selectedHouse,
  onSelectHouse,
  directions,
  userLocation,
  showStopNumbers = false,
}: ChristmasMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Fit bounds to show all houses
  const fitBounds = useCallback(() => {
    if (map && houses.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      houses.forEach((house) => {
        bounds.extend({ lat: house.lat, lng: house.lng });
      });
      if (userLocation) {
        bounds.extend(userLocation);
      }
      map.fitBounds(bounds, 80);
    }
  }, [map, houses, userLocation]);

  // Fit bounds when houses change
  if (map && houses.length > 0) {
    setTimeout(fitBounds, 100);
  }

  const center = userLocation || (houses.length > 0 ? { lat: houses[0].lat, lng: houses[0].lng } : defaultCenter);

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center}
      zoom={12}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: mapStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      }}
    >
      {houses.map((house, index) => (
        <HouseMarker
          key={house.id}
          house={house}
          displayNumber={showStopNumbers ? index + 1 : house.number}
          isSelected={selectedHouse === house.id}
          onClick={() => onSelectHouse(house.id)}
        />
      ))}
      
      {directions.map((directionResult, index) => (
        <DirectionsRenderer
          key={index}
          directions={directionResult}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#ef4444',
              strokeWeight: 4,
              strokeOpacity: 0.85,
              icons: [
                {
                  icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 2.5,
                    strokeColor: '#ffffff',
                    strokeWeight: 1,
                    fillColor: '#ef4444',
                    fillOpacity: 1,
                  },
                  offset: '0',
                  repeat: '150px',
                },
              ],
            },
          }}
        />
      ))}

      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            url: `data:image/svg+xml,${encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="3"/>
                <circle cx="12" cy="12" r="4" fill="white"/>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(24, 24),
            anchor: new google.maps.Point(12, 12),
          }}
          title="Your location"
          zIndex={1000}
        />
      )}
    </GoogleMap>
  );
}

