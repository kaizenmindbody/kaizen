"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, X, Award, Phone, Languages } from 'lucide-react';
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
    <div>
      <div>
        <h3 className="text-xl md:text-2xl font-semibold text-primary mb-3 md:mb-4">Location</h3>
        {practitioner.address && practitioner.address.trim() !== '' ? (
          <>
            <div className="rounded-xl h-64 md:h-96 mb-3 md:mb-4 overflow-hidden">
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
            <div className="space-y-2 text-gray-700">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm md:text-base">{practitioner.address}</span>
              </div>
              <button className="text-blue-600 text-sm hover:underline">Get Directions</button>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 rounded-xl h-64 md:h-96 mb-3 md:mb-4 flex items-center justify-center">
            <div className="text-center px-4">
              <MapPin className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
              <h4 className="text-base md:text-lg font-medium text-gray-600 mb-2">Location Not Available</h4>
              <p className="text-sm text-gray-500">
                This practitioner has not provided their practice location yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
