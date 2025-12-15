'use client';

import { InfoWindow, Marker } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import { House } from '@/types/house';

interface HouseMarkerProps {
  house: House;
  displayNumber: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function HouseMarker({ house, displayNumber, isSelected, onClick }: HouseMarkerProps) {
  const [showInfo, setShowInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dynamic size based on screen - much smaller on mobile
  const size = isMobile ? 20 : 36;
  const fontSize = isMobile ? 8 : 12;

  // Create a custom SVG marker icon that looks like a Christmas ornament
  const markerIcon = {
    url: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size * 1.3}" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4L22 8H18L20 4Z" fill="#FFD700"/>
        <circle cx="20" cy="28" r="18" fill="${isSelected ? '#10B981' : '#EF4444'}"/>
        <circle cx="20" cy="28" r="18" fill="url(#gradient)"/>
        <circle cx="14" cy="22" r="4" fill="rgba(255,255,255,0.3)"/>
        <text x="20" y="33" text-anchor="middle" fill="white" font-size="${fontSize}" font-weight="bold" font-family="Arial">${displayNumber}</text>
        <defs>
          <linearGradient id="gradient" x1="2" y1="10" x2="38" y2="46" gradientUnits="userSpaceOnUse">
            <stop stop-color="${isSelected ? '#34D399' : '#F87171'}"/>
            <stop offset="1" stop-color="${isSelected ? '#059669' : '#B91C1C'}"/>
          </linearGradient>
        </defs>
      </svg>
    `)}`,
    scaledSize: new google.maps.Size(size, size * 1.3),
    anchor: new google.maps.Point(size / 2, size * 1.3),
  };

  return (
    <>
      <Marker
        position={{ lat: house.lat, lng: house.lng }}
        icon={markerIcon}
        onClick={() => {
          setShowInfo(true);
          onClick?.();
        }}
        animation={isSelected ? google.maps.Animation.BOUNCE : undefined}
      />
      {showInfo && (
        <InfoWindow
          position={{ lat: house.lat, lng: house.lng }}
          onCloseClick={() => setShowInfo(false)}
          options={{ pixelOffset: new google.maps.Size(0, -52) }}
        >
          <div className="p-2 min-w-[200px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                {displayNumber}
              </span>
              <h3 className="font-bold text-gray-900 text-lg">
                Stop #{displayNumber}
              </h3>
            </div>
            <p className="text-gray-600 text-sm">{house.address}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

