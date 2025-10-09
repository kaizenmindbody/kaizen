"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, X, Award, Phone, Languages, Navigation, Building2 } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/formatters';

interface LocationProps {
  practitioner: any;
  mapCenter: { lat: number; lng: number };
  showInfoWindow: boolean;
  setShowInfoWindow: (show: boolean) => void;
}

// Utility function to safely parse and format specialties
const formatSpecialties = (specialty) => {
  if (!specialty) return 'General Practice';

  try {
    // If it's already an array, join it
    if (Array.isArray(specialty)) {
      const validSpecialties = specialty.filter(item => item && item.trim());
      return validSpecialties.length > 0 ? validSpecialties.join('• ') : 'General Practice';
    }

    // If it's a string, try to parse as JSON
    if (typeof specialty === 'string') {
      try {
        const parsed = JSON.parse(specialty);
        if (Array.isArray(parsed)) {
          const validSpecialties = parsed.filter(item => item && item.trim());
          return validSpecialties.length > 0 ? validSpecialties.join('• ') : 'General Practice';
        }
      } catch {
        // If JSON parsing fails, treat as single specialty
        return specialty.trim() || 'General Practice';
      }

      // Regular string
      return specialty.trim() || 'General Practice';
    }

    return 'General Practice';
  } catch (error) {
    console.warn('Error formatting specialties:', error);
    return 'General Practice';
  }
};

export const Location = ({ practitioner, mapCenter, showInfoWindow, setShowInfoWindow }: LocationProps) => {
  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  return (
    <div className=" mx-auto">
      <div className="space-y-6">
        {/* Page Title */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Practice Location</h3>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"></div>
        </div>

        {practitioner.address && practitioner.address.trim() !== '' ? (
          <>
            {/* Map Container */}
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-2xl overflow-hidden">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={15}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                  }}
                >
                  <Marker
                    position={mapCenter}
                    title={practitioner.full_name}
                    onClick={() => setShowInfoWindow(true)}
                  />
                  {showInfoWindow && (
                    <InfoWindow
                      position={mapCenter}
                      onCloseClick={() => setShowInfoWindow(false)}
                    >
                      <div className="p-0 max-w-xs bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="relative">
                          {/* Header with gradient background */}
                          <div className="bg-gradient-to-r from-primary/10 to-primary/20 p-3 relative">
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <Image
                                  src={practitioner.avatar.url}
                                  alt={practitioner.avatar.alt}
                                  width={45}
                                  height={45}
                                  className="rounded-full object-cover border-2 border-white shadow-md"
                                />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
                                  {practitioner.full_name}
                                </h4>
                                {practitioner.title && (
                                  <p className="text-xs text-primary font-medium mb-1 truncate">
                                    {practitioner.title}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-3 space-y-2">
                            {practitioner.specialty && (
                              <div className="flex items-center gap-2">
                                <Award className="w-3 h-3 text-primary" />
                                <span className="text-xs text-gray-700 font-medium truncate">
                                  {formatSpecialties(practitioner.specialty)}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600 truncate">
                                {practitioner.address}
                              </span>
                            </div>

                            {practitioner.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">
                                  {formatPhoneNumber(practitioner.phone)}
                                </span>
                              </div>
                            )}

                            {practitioner.languages && practitioner.languages.length > 0 && (
                              <div className="flex items-center gap-2">
                                <Languages className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">
                                  {Array.isArray(practitioner.languages)
                                    ? practitioner.languages.join(', ')
                                    : practitioner.languages}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-2 p-3 pt-0">
                            <button
                              onClick={() => setShowInfoWindow(false)}
                              className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => setShowInfoWindow(false)}
                              className="px-2 py-2 border border-gray-300 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Practice Address</h4>
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 leading-relaxed text-base">{practitioner.address}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(practitioner.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
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
                This practitioner has not provided their practice location yet. Please contact them directly for location information.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
