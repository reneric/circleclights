'use client';

import { useLoadScript } from '@react-google-maps/api';
import { useState, useEffect, useCallback } from 'react';
import { houses } from '@/data/houses';
import ChristmasMap from '@/components/ChristmasMap';
import Snowfall from '@/components/Snowfall';
import InfoModal from '@/components/InfoModal';

const libraries: ("places" | "geometry" | "drawing")[] = ['places'];

export default function Home() {
  const [selectedHouse, setSelectedHouse] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [optimizedOrder, setOptimizedOrder] = useState<typeof houses>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Get user location on load
  useEffect(() => {
    if (!navigator.geolocation) {
      // Use timeout to avoid synchronous setState in effect
      const timer = setTimeout(() => setLocationError(true), 0);
      return () => clearTimeout(timer);
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setLocationError(true);
      }
    );
  }, []);

  const buildRoute = useCallback(async () => {
    if (!userLocation) {
      alert('Please enable location access to build your route!');
      return;
    }
    if (houses.length < 1) return;

    setIsLoadingRoute(true);
    const directionsService = new google.maps.DirectionsService();

    // First, sort all houses using nearest-neighbor algorithm for better clustering
    const sortedHouses = [...houses];
    const visited = new Set<number>();
    const orderedIndices: number[] = [];
    
    // Start from user location
    let currentPos = userLocation;
    
    while (orderedIndices.length < sortedHouses.length) {
      let nearestIdx = -1;
      let nearestDist = Infinity;
      
      for (let i = 0; i < sortedHouses.length; i++) {
        if (visited.has(i)) continue;
        const house = sortedHouses[i];
        const dist = Math.pow(house.lat - currentPos.lat, 2) + Math.pow(house.lng - currentPos.lng, 2);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }
      
      if (nearestIdx >= 0) {
        visited.add(nearestIdx);
        orderedIndices.push(nearestIdx);
        currentPos = { lat: sortedHouses[nearestIdx].lat, lng: sortedHouses[nearestIdx].lng };
      }
    }
    
    const nearestNeighborOrder = orderedIndices.map(i => sortedHouses[i]);

    // Now chunk the pre-sorted houses and get directions for each chunk
    const MAX_WAYPOINTS = 23;
    const allResults: google.maps.DirectionsResult[] = [];
    let totalDistance = 0;
    let totalDuration = 0;
    const finalOrderedHouses: typeof houses = [];

    try {
      let currentOrigin = userLocation;
      let remainingHouses = [...nearestNeighborOrder];

      while (remainingHouses.length > 0) {
        const chunkSize = Math.min(remainingHouses.length, MAX_WAYPOINTS + 1);
        const chunk = remainingHouses.slice(0, chunkSize);
        remainingHouses = remainingHouses.slice(chunkSize);

        const waypoints = chunk.slice(0, -1).map((house) => ({
          location: { lat: house.lat, lng: house.lng },
          stopover: true,
        }));

        const destination = {
          lat: chunk[chunk.length - 1].lat,
          lng: chunk[chunk.length - 1].lng,
        };

        const result = await directionsService.route({
          origin: currentOrigin,
          destination,
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        });

        allResults.push(result);

        // Get the optimized order for this chunk
        const waypointOrder = result.routes[0].waypoint_order;
        waypointOrder.forEach((idx) => {
          finalOrderedHouses.push(chunk[idx]);
        });
        // Add the destination (last house in chunk)
        finalOrderedHouses.push(chunk[chunk.length - 1]);

        result.routes[0].legs.forEach((leg) => {
          totalDistance += leg.distance?.value || 0;
          totalDuration += leg.duration?.value || 0;
        });

        currentOrigin = destination;
      }

      setDirections(allResults);
      setOptimizedOrder(finalOrderedHouses);
      
      setRouteInfo({
        distance: `${(totalDistance / 1609.34).toFixed(1)} mi`,
        duration: `${Math.round(totalDuration / 60)} min`,
      });
    } catch (error: unknown) {
      console.error('Directions error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Could not calculate route: ${errorMessage}`);
    }

    setIsLoadingRoute(false);
  }, [userLocation]);

  const clearRoute = () => {
    setDirections([]);
    setRouteInfo(null);
    setOptimizedOrder([]);
  };

  const handleOpenGoogleMaps = (url: string, partNum: number, totalParts: number) => {
    const hasSeenModal = localStorage.getItem('hasSeenMapsInfoModal');
    
    if (!hasSeenModal && totalParts > 1) {
      // Show modal first time
      setPendingMapUrl({ url, partNum });
      setShowInfoModal(true);
    } else {
      // Already seen, just open
      window.open(url, '_blank');
      setShowMapsMenu(false);
    }
  };

  const handleModalContinue = () => {
    localStorage.setItem('hasSeenMapsInfoModal', 'true');
    if (pendingMapUrl) {
      window.open(pendingMapUrl.url, '_blank');
      setShowMapsMenu(false);
    }
    setShowInfoModal(false);
    setPendingMapUrl(null);
  };

  const handleModalClose = () => {
    setShowInfoModal(false);
    setPendingMapUrl(null);
  };

  const [showMapsMenu, setShowMapsMenu] = useState(false);
  const [pendingMapUrl, setPendingMapUrl] = useState<{ url: string; partNum: number } | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Generate Google Maps URLs - split into parts since Maps only supports ~10 waypoints
  const mapsUrls = (() => {
    if (!userLocation || optimizedOrder.length === 0) return [];
    
    const MAX_WAYPOINTS = 9;
    const urls: { label: string; url: string }[] = [];
    
    let currentOrigin = `${userLocation.lat},${userLocation.lng}`;
    let remainingHouses = [...optimizedOrder];
    let partNum = 1;
    const totalParts = Math.ceil(optimizedOrder.length / (MAX_WAYPOINTS + 1));
    
    while (remainingHouses.length > 0) {
      const chunkSize = Math.min(remainingHouses.length, MAX_WAYPOINTS + 1);
      const chunk = remainingHouses.slice(0, chunkSize);
      remainingHouses = remainingHouses.slice(chunkSize);
      
      const destination = `${chunk[chunk.length - 1].lat},${chunk[chunk.length - 1].lng}`;
      const waypoints = chunk.slice(0, -1).map(h => `${h.lat},${h.lng}`).join('|');
      
      const url = `https://www.google.com/maps/dir/?api=1&origin=${currentOrigin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=driving`;
      
      urls.push({
        label: totalParts > 1 ? `Part ${partNum} of ${totalParts}` : 'Open in Google Maps',
        url,
      });
      
      currentOrigin = destination;
      partNum++;
    }
    
    return urls;
  })();

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-green-900">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">🎄</div>
          <h1 className="text-2xl font-bold mb-4">Error Loading Maps</h1>
          <p>Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 to-green-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl">Loading Christmas Magic...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <Snowfall />
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl md:text-4xl">🎄</div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white font-[family-name:var(--font-crimson)]">
                Circle C Ranch Christmas Lights
              </h1>
              <p className="text-gray-400 text-xs md:text-sm">{houses.length} decorated houses to visit!</p>
            </div>
          </div>
        </div>
      </header>

      {/* Full screen map */}
      <div className="absolute inset-0">
        <ChristmasMap
          houses={optimizedOrder.length > 0 ? optimizedOrder : houses}
          selectedHouse={selectedHouse}
          onSelectHouse={setSelectedHouse}
          directions={directions}
          userLocation={userLocation}
          showStopNumbers={optimizedOrder.length > 0}
        />
      </div>

      {/* Route Builder Panel - Bottom of screen */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto">
          {/* Location warning */}
          {locationError && (
            <div className="bg-yellow-500/90 backdrop-blur-sm text-black px-4 py-2 rounded-t-xl text-sm text-center">
              📍 Enable location access to build your driving route
            </div>
          )}
          
          <div className={`bg-gradient-to-r from-green-900/95 to-green-950/95 backdrop-blur-sm p-4 border border-green-500/30 shadow-2xl ${locationError ? 'rounded-b-xl' : 'rounded-xl'}`}>
            {routeInfo ? (
              /* Route info display */
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="bg-black/30 rounded-lg p-2 text-center">
                      <p className="text-green-300 text-[10px] uppercase tracking-wider">Distance</p>
                      <p className="text-white font-bold text-lg">{routeInfo.distance}</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2 text-center">
                      <p className="text-green-300 text-[10px] uppercase tracking-wider">Drive Time</p>
                      <p className="text-white font-bold text-lg">{routeInfo.duration}</p>
                    </div>
                  </div>
                  <button
                    onClick={clearRoute}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold p-2 rounded-lg transition-all"
                    title="Clear route"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {mapsUrls.length === 1 ? (
                  <button
                    onClick={() => window.open(mapsUrls[0].url, '_blank')}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Open in Google Maps
                  </button>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowMapsMenu(!showMapsMenu)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      Open in Google Maps ({mapsUrls.length} parts)
                      <svg className={`w-4 h-4 transition-transform ${showMapsMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showMapsMenu && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700">
                        {mapsUrls.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => handleOpenGoogleMaps(item.url, i + 1, mapsUrls.length)}
                            className="w-full px-4 py-3 text-white hover:bg-gray-700 transition-colors text-left flex items-center gap-2"
                          >
                            <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                              {i + 1}
                            </span>
                            {item.label}
                          </button>
                        ))}
                        <div className="px-4 py-2 bg-gray-900 text-gray-400 text-xs">
                          Complete each part in order
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Build route button */
              <button
                onClick={buildRoute}
                disabled={isLoadingRoute || !userLocation}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg disabled:cursor-not-allowed text-lg"
              >
                {isLoadingRoute ? (
                  <>
                    <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Building Your Route...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Build My Driving Route
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* House count badge */}
      <div className="absolute top-20 right-4 z-20">
        <div className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
          <span className="text-xl">🏠</span>
          <span>{houses.length} Houses</span>
        </div>
      </div>

      {/* Decorative lights at the top */}
      <div className="fixed top-0 left-0 right-0 h-1 flex z-10 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-lights"
            style={{
              backgroundColor: ['#ef4444', '#22c55e', '#eab308', '#3b82f6'][i % 4],
              animationDelay: `${(i % 4) * 0.25}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative lights at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-1 flex z-10 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-lights"
            style={{
              backgroundColor: ['#ef4444', '#22c55e', '#eab308', '#3b82f6'][i % 4],
              animationDelay: `${(i % 4) * 0.25}s`,
            }}
          />
        ))}
      </div>

      {/* Info modal for first-time Google Maps opens */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={handleModalClose}
        onContinue={handleModalContinue}
        partNumber={pendingMapUrl?.partNum || 1}
        totalParts={mapsUrls.length}
      />
    </main>
  );
}
