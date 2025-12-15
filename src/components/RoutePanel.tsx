'use client';

import { House } from '@/types/house';

interface RoutePanelProps {
  houses: House[];
  isLoading: boolean;
  routeInfo: { distance: string; duration: string } | null;
  onBuildRoute: () => void;
  onClearRoute: () => void;
  userLocation: { lat: number; lng: number } | null;
}

export default function RoutePanel({
  houses,
  isLoading,
  routeInfo,
  onBuildRoute,
  onClearRoute,
  userLocation,
}: RoutePanelProps) {
  return (
    <div className="bg-gradient-to-br from-green-900/80 to-green-950/80 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Route Builder</h2>
          <p className="text-green-300 text-sm">Plan your lights tour</p>
        </div>
      </div>

      {!userLocation && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
          <p className="text-yellow-200 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Enable location access for personalized routes
          </p>
        </div>
      )}

      {houses.length === 0 ? (
        <p className="text-gray-400 text-center py-4">
          Upload addresses to build a route
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 p-3 bg-black/20 rounded-lg">
            <span className="text-green-200">Houses to visit:</span>
            <span className="text-2xl font-bold text-white">{houses.length}</span>
          </div>

          {routeInfo && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <p className="text-green-300 text-xs uppercase tracking-wider">Distance</p>
                <p className="text-white font-bold text-lg">{routeInfo.distance}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <p className="text-green-300 text-xs uppercase tracking-wider">Duration</p>
                <p className="text-white font-bold text-lg">{routeInfo.duration}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onBuildRoute}
              disabled={isLoading || houses.length < 2}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Building Route...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Build My Route
                </>
              )}
            </button>
            {routeInfo && (
              <button
                onClick={onClearRoute}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

