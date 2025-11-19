"use client";

import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Navigation } from 'lucide-react';

interface LocationProps {
  clinic: any;
  mapCenter: { lat: number; lng: number };
  showInfoWindow: boolean;
  setShowInfoWindow: (show: boolean) => void;
}

export const Location = ({ clinic, mapCenter, showInfoWindow, setShowInfoWindow }: LocationProps) => {
  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '12px'
  };

  const getDirectionsUrl = () => {
    if (!clinic.clinic_address) return '#';
    const address = encodeURIComponent(clinic.clinic_address);
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4" style={{ color: '#35375F' }}>
        Location & Directions
      </h2>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Google Map */}
        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
          {typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <LoadScript
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              loadingElement={
                <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading map...</p>
                  </div>
                </div>
              }
            >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={15}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
              >
                <Marker
                  position={mapCenter}
                  onClick={() => setShowInfoWindow(true)}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  }}
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
              </GoogleMap>
            </LoadScript>
          ) : (
            <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center rounded-xl">
              <div className="text-center p-8">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Map View Unavailable</h3>
                <p className="text-gray-600 mb-4">
                  {clinic.clinic_address
                    ? 'Unable to load map at this time.'
                    : 'No address available for this clinic.'}
                </p>
                {clinic.clinic_address && (
                  <a
                    href={getDirectionsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Open in Google Maps
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Clinic Details */}
        <div className="space-y-6">
          {/* Address Card */}
          {clinic.clinic_address && (
            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Clinic Address
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-2">{clinic.clinic_name}</p>
                  <p className="text-gray-700 leading-relaxed">{clinic.clinic_address}</p>
                </div>
                <a
                  href={getDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </a>
              </div>
            </div>
          )}

          {/* Contact Information Card */}
          <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contact Information
            </h3>
            <div className="space-y-3">
              {clinic.clinic_phone && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Phone</p>
                  <a
                    href={`tel:${clinic.clinic_phone}`}
                    className="text-gray-900 hover:text-primary transition-colors font-medium"
                  >
                    {clinic.clinic_phone}
                  </a>
                </div>
              )}
              {clinic.clinic_email && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Email</p>
                  <a
                    href={`mailto:${clinic.clinic_email}`}
                    className="text-gray-900 hover:text-primary transition-colors font-medium break-all"
                  >
                    {clinic.clinic_email}
                  </a>
                </div>
              )}
              {clinic.clinic_website && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Website</p>
                  <a
                    href={clinic.clinic_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-primary transition-colors font-medium break-all"
                  >
                    {clinic.clinic_website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Parking Information Card */}
          <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Parking Information
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Convenient parking is available near the clinic. Please check with our staff for specific parking instructions.
            </p>
          </div>

          {/* Accessibility Card */}
          <div className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Accessibility
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Our clinic is wheelchair accessible and equipped to accommodate patients with special needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
