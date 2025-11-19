"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Building2 } from 'lucide-react';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

// Dynamically import Google Maps components with SSR disabled
const GoogleMap = dynamic(
  () => import('@react-google-maps/api').then((mod) => mod.GoogleMap),
  { ssr: false }
);

const MarkerF = dynamic(
  () => import('@react-google-maps/api').then((mod) => mod.MarkerF),
  { ssr: false }
);

const InfoWindow = dynamic(
  () => import('@react-google-maps/api').then((mod) => mod.InfoWindowF),
  { ssr: false }
);

interface LocationProps {
  clinic: any;
  mapCenter: { lat: number; lng: number };
  showInfoWindow: boolean;
  setShowInfoWindow: (show: boolean) => void;
}

export const Location = ({ clinic, mapCenter, showInfoWindow, setShowInfoWindow }: LocationProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if Google Maps is loaded
  useEffect(() => {
    if (!isClient) return;

    let timeoutCount = 0;
    const maxTimeout = 50; // 5 seconds max wait time

    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
      } else if (timeoutCount < maxTimeout) {
        timeoutCount++;
        setTimeout(checkGoogleMaps, 100);
      } else {
        console.error('Google Maps failed to load. Please check your API key configuration.');
        // Set loaded to false to show error message
        setIsGoogleMapsLoaded(false);
      }
    };
    checkGoogleMaps();
  }, [isClient]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const getDirectionsUrl = () => {
    if (!clinic.clinic_address) return '#';
    const address = encodeURIComponent(clinic.clinic_address);
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  };

  return (
    <div className="mx-auto">
      <div className="space-y-6">
        {/* Page Title */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Location & Directions</h3>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"></div>
        </div>

        {clinic.clinic_address && clinic.clinic_address.trim() !== '' ? (
          <>
            {/* Map Container */}
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-2xl overflow-hidden">
                {isClient && isGoogleMapsLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={15}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                    }}
                    onLoad={onMapLoad}
                  >
                    {map && (
                      <>
                        <MarkerF
                          position={mapCenter}
                          title={clinic.clinic_name}
                          onClick={() => setShowInfoWindow(true)}
                        />
                        {showInfoWindow && (
                          <InfoWindow
                            position={mapCenter}
                            onCloseClick={() => setShowInfoWindow(false)}
                          >
                            <div className="p-2">
                              <h3 className="font-bold text-gray-900 mb-1">{clinic.clinic_name}</h3>
                              <p className="text-sm text-gray-600">{clinic.clinic_address}</p>
                            </div>
                          </InfoWindow>
                        )}
                      </>
                    )}
                  </GoogleMap>
                ) : isClient ? (
                  <div className="flex flex-col items-center justify-center gap-3" style={mapContainerStyle}>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-gray-500">Loading map...</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center" style={mapContainerStyle}>
                    <p className="text-gray-500">Initializing...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address Card - Only showing clinic address */}
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Clinic Address</h4>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">{clinic.clinic_name}</p>
                        <span className="text-gray-700 leading-relaxed text-base">{clinic.clinic_address}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 w-full md:w-auto">
                  <a
                    href={getDirectionsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap w-full md:w-auto"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-12 md:p-16 shadow-sm">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-xl font-bold text-gray-700 mb-3">Location Not Available</h4>
              <p className="text-base text-gray-500 leading-relaxed">
                This clinic has not provided their location yet. Please contact them directly for location information.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
