'use client';

import React from 'react';
import NextImage from 'next/image';
import { Heart, MapPin, Building, ExternalLink } from 'lucide-react';
import { UserData } from '@/types/user';
import { getAvatarUrl, formatPractitionerType } from '@/lib/formatters';

interface UserCardProps {
  practitioner: UserData;
  onNavigate: (practitioner: UserData) => void;
  onBooking?: (practitioner: UserData) => void;
  isOwnProfile?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  practitioner,
  onNavigate,
  onBooking,
  isOwnProfile = false
}) => {
  const fullName = `${practitioner.firstname || ''} ${practitioner.lastname || ''}`.trim() || 'Practitioner';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow w-full">
      {/* Mobile Layout (below xs) */}
      <div className="xs:hidden space-y-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0 w-full aspect-square p-2">
          <NextImage
            src={getAvatarUrl(practitioner.avatar)}
            alt={fullName}
            width={250}
            height={250}
            className="w-full h-full rounded-lg object-cover"
          />
          <Heart className="absolute top-4 right-4 w-6 h-6 text-yellow-400 fill-current z-10" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          {/* Practitioner Type */}
          <div className="text-center">
            <p className="text-base text-[#0E9384]">
              {formatPractitionerType(practitioner.ptype)}
            </p>
          </div>

          {/* Name */}
          <div className="text-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(practitioner);
              }}
              className="font-semibold text-gray-900 hover:text-primary transition-colors text-lg"
            >
              {fullName}
            </button>
          </div>

          {/* Degrees */}
          <div className="text-center">
            <p className="text-xs text-gray-500">{practitioner.degree}</p>
          </div>

          {/* Address */}
          <div className="flex items-start justify-center space-x-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-center">{practitioner.address}</span>
          </div>

          {/* Clinic */}
          {practitioner.clinic && (
            <div className="flex items-start justify-center space-x-1 text-sm text-gray-600">
              <Building className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-center">{practitioner.clinic}</span>
            </div>
          )}

          {/* Background */}
          {practitioner.background && (
            <div className="text-center">
              <p className="text-xs text-gray-600 line-clamp-5">{practitioner.background}</p>
            </div>
          )}

          {/* Languages */}
          {practitioner.description_languages && (
            <div className="text-center">
              <div className="flex flex-wrap justify-center gap-1.5">
                {practitioner.description_languages.split(',').map((lang, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {lang.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Website */}
          {practitioner.website && (
            <div className="text-center w-full">
              <a
                href={practitioner.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Visit Website</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Medium Layout (xs to md) - Image left, content right single column */}
      <div className="hidden xs:flex md:hidden items-stretch space-x-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0 w-[180px] p-2">
          <NextImage
            src={getAvatarUrl(practitioner.avatar)}
            alt={fullName}
            width={180}
            height={300}
            className="w-full h-full rounded-lg object-cover"
          />
          <Heart className="absolute top-4 right-4 w-5 h-5 text-yellow-400 fill-current z-10" />
        </div>

        {/* Content as single column - now matches image height */}
        <div className="flex-1 flex flex-col min-h-[180px]">
          <div className="flex-1">
            <p className="text-base text-[#0E9384] mb-1">
              {formatPractitionerType(practitioner.ptype)}
            </p>
            <div className="mb-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(practitioner);
                }}
                className="font-semibold text-gray-900 hover:text-primary transition-colors text-xl mb-2"
              >
                {fullName}
              </button>
              <p className="text-xs text-gray-500 mb-3">{practitioner.degree}</p>
              <div className="flex items-center space-x-1 mb-2 mt-2 text-sm text-gray-600">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs">{practitioner.address}</span>
              </div>

              {practitioner.clinic && (
                <div className="flex items-center space-x-1 mb-2 text-sm text-gray-600">
                  <Building className="w-3 h-3 flex-shrink-0" />
                  <span className="text-xs">{practitioner.clinic}</span>
                </div>
              )}
            </div>

            {/* Background */}
            {practitioner.background && (
              <div className="mb-2">
                <p className="text-xs text-gray-600 line-clamp-4">{practitioner.background}</p>
              </div>
            )}

            {/* Languages */}
            {practitioner.description_languages && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-1.5">
                  {practitioner.description_languages.split(',').map((lang, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {lang.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Website */}
            {practitioner.website && (
              <div className="mb-2">
                <a
                  href={practitioner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Visit Website</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout (md and above) */}
      <div className="hidden md:flex items-stretch space-x-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0 w-[250px] p-2">
          <NextImage
            src={getAvatarUrl(practitioner.avatar)}
            alt={fullName}
            width={250}
            height={350}
            className="w-full h-full rounded-lg object-cover"
          />
          <Heart className="absolute top-4 right-4 w-6 h-6 text-yellow-400 fill-current" />
        </div>

        {/* Main Info - now matches image height */}
        <div className="flex-1 flex flex-col min-h-[250px]">
          <div className="flex-1">
            <p className="text-base text-[#0E9384] mb-1">
              {formatPractitionerType(practitioner.ptype)}
            </p>
            <div className="flex flex-row justify-between items-center mb-4">
              <div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(practitioner);
                  }}
                  className="font-semibold text-gray-900 hover:text-primary transition-colors text-2xl mb-3"
                >
                  {fullName}
                </button>
                <p className="text-xs text-gray-500 mb-3">{practitioner.degree}</p>
                <div className="flex items-center space-x-1 mb-3 mt-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{practitioner.address}</span>
                </div>

                {practitioner.clinic && (
                  <div className="flex items-center space-x-1 mb-3 text-sm text-gray-600">
                    <Building className="w-4 h-4 flex-shrink-0" />
                    <span>{practitioner.clinic}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {/* Languages */}
                {practitioner.description_languages && (
                  <div>
                    <div className="flex flex-wrap gap-1.5">
                      {practitioner.description_languages.split(',').map((lang, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {lang.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Website */}
                {practitioner.website && (
                  <div>
                    <a
                      href={practitioner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 text-xs font-medium transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Visit Website</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Background */}
            {practitioner.background && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 line-clamp-4">{practitioner.background}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
