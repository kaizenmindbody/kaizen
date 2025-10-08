'use client'

import React, { useState, useMemo, useEffect, Suspense } from 'react';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Heart, X, Building, Filter, Phone, Eye, Star, ExternalLink  } from 'lucide-react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import Select from 'react-select';
import Breadcrumb from '@/components/commons/breadcrumb';
import { usePractitionersDirectory } from '@/hooks/usePractitionersDirectory';
import Switch from 'react-switch';
import { useAuth } from '@/contexts/AuthContext';
import states from 'states-us';
import { Specialty } from '@/types/user';

// Phone number formatting utility
const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different phone number lengths
  if (cleaned.length === 10) {
    // US format: (123) 456-7890
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    // US format with country code: +1 (123) 456-7890
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length > 10) {
    // International format: +XX XXX XXX XXXX
    return `+${cleaned}`;
  } else {
    // Return as-is if it doesn't match common patterns
    return phone;
  }
};

// Avatar URL helper utility
const getAvatarUrl = (avatar: string | { url: string; alt: string } | null | undefined): string => {
  if (!avatar) {
    return "https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg";
  }
  
  if (typeof avatar === 'string') {
    return avatar;
  }
  
  if (typeof avatar === 'object' && avatar.url) {
    return avatar.url;
  }
  
  return "https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg";
};

// Utility function to safely parse and format specialties
const formatSpecialties = (specialty) => {
  if (!specialty) return 'General Practice';
  
  try {
    // If it's already an array, join it
    if (Array.isArray(specialty)) {
      const validSpecialties = specialty.filter(item => item && item.trim());
      return validSpecialties.length > 0 ? validSpecialties.join('• ') : '';
    }
    
    // If it's a string, try to parse as JSON
    if (typeof specialty === 'string') {
      // First check if it looks like JSON (starts with [ or ")
      if (specialty.trim().startsWith('[') || specialty.trim().startsWith('"')) {
        const parsed = JSON.parse(specialty);
        if (Array.isArray(parsed)) {
          const validSpecialties = parsed.filter(item => item && item.trim());
          return validSpecialties.length > 0 ? validSpecialties.join(' • ') : '';
        }
        return parsed || '';
      }
      // If not JSON, treat as regular string
      return specialty.trim() || '';
    }
    
    return '';
  } catch {
    // If JSON parsing fails, treat as regular string
    return typeof specialty === 'string' ? (specialty.trim() || 'General Practice') : 'General Practice';
  }
};

// Reusable User Card Component
const UserCard = ({ practitioner, onNavigate, onBooking, isOwnProfile = false }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow w-full">
      {/* Mobile Layout (below xs) */}
      <div className="xs:hidden space-y-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0 w-full aspect-square p-2">
          <Image
            src={getAvatarUrl(practitioner.avatar)}
            alt={practitioner.full_name || "Practitioner"}
            width={250}
            height={250}
            className="w-full h-full rounded-lg object-cover"
          />
          <div className="absolute top-4 left-4 bg-primary text-white text-xs px-1.5 py-0.5 rounded z-10">
            4.8
          </div>
          <Heart className="absolute top-4 right-4 w-6 h-6 text-yellow-400 fill-current z-10" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          {/* Specialty */}
          <div className="text-center">
            <p className="text-base text-[#0E9384]">
              {formatSpecialties(practitioner.specialty)}
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
              {practitioner.full_name}
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

          {/* Experience */}
          {practitioner.experience && (
            <div className="flex items-start justify-center space-x-2 text-sm text-gray-600">
              <Eye className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-center">{practitioner.experience} years of experience</span>
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

        {/* Bottom section */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-center">
          {practitioner.rate?
            <div>
              <p className="text-sm text-gray-600">Fees start at</p>
              <p className="text-xl font-semibold text-primary">${practitioner.rate}</p>
            </div>
            : ''}
            <div>
              <p className="text-sm text-gray-600">Next available</p>
              <p className="text-sm text-gray-900">{practitioner.nextAvailable}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medium Layout (xs to md) - Image left, content right single column */}
      <div className="hidden xs:flex md:hidden items-stretch space-x-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0 w-[180px] p-2">
          <Image
            src={getAvatarUrl(practitioner.avatar)}
            alt={practitioner.full_name || "Practitioner"}
            width={180}
            height={300}
            className="w-full h-full rounded-lg object-cover"
          />
          <div className="absolute top-4 left-4 bg-primary text-white text-xs px-1.5 py-0.5 rounded z-10">
            4.8
          </div>
          <Heart className="absolute top-4 right-4 w-5 h-5 text-yellow-400 fill-current z-10" />
        </div>

        {/* Content as single column - now matches image height */}
        <div className="flex-1 flex flex-col min-h-[180px]">
          <div className="flex-1">
            <p className="text-base text-[#0E9384] mb-1">
              {formatSpecialties(practitioner.specialty)}
            </p>
            <div className="mb-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(practitioner);
                }}
                className="font-semibold text-gray-900 hover:text-primary transition-colors text-xl mb-2"
              >
                {practitioner.full_name}
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

            <div className="space-y-1 text-sm text-gray-600 mb-2">
              {practitioner.experience &&
                <div className="flex items-center space-x-2 mt-3">
                  <Eye className="w-3 h-3" />
                  <span className="text-xs">{practitioner.experience}</span>&nbsp;years of experience
                </div>
              }
              {practitioner.website && (
                <div>
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

          {/* Bottom section */}
          <div className="mt-auto pt-2 border-t border-gray-100">
            <div className="flex xs:flex-col sm:flex-row items-center justify-between">
              <div className='flex space-x-4'>
              {practitioner.rate?
                <div>
                  <p className="text-xs text-gray-600">Fees start at</p>
                  <p className="text-lg font-semibold text-primary">${practitioner.rate}</p>
                </div>
                : ''}
                <div>
                  <p className="text-xs text-gray-600">Next available</p>
                  <p className="text-xs text-gray-900">{practitioner.nextAvailable}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout (md and above) */}
      <div className="hidden md:flex items-stretch space-x-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0 w-[250px] p-2">
          <Image
            src={getAvatarUrl(practitioner.avatar)}
            alt={practitioner.full_name || "Practitioner"}
            width={250}
            height={350}
            className="w-full h-full rounded-lg object-cover"
          />
          <div className="absolute top-4 left-4 bg-primary text-white text-xs px-1.5 py-0.5 rounded">
            4.8
          </div>
          <Heart className="absolute top-4 right-4 w-6 h-6 text-yellow-400 fill-current" />
        </div>

        {/* Main Info - now matches image height */}
        <div className="flex-1 flex flex-col min-h-[250px]">
          <div className="flex-1">
            <p className="text-base text-[#0E9384] mb-1">
              {formatSpecialties(practitioner.specialty)}
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
                  {practitioner.full_name}
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

              <div>
                <div className="space-y-1 text-sm text-gray-600">
                  {practitioner.experience && 
                  <div className="flex items-center space-x-2 mt-3">
                    <Eye className="w-4 h-4" />
                    <span className="text-xs">{practitioner.experience}</span> &nbsp;years of experience
                  </div>
                  }
                </div>

                {practitioner.website && (
                  <div className="mt-2">
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
          </div>

          {/* Bottom section */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row sm:items-center lg:items-start xl:items-center sm:justify-between lg:justify-start xl:justify-between space-y-3 sm:space-y-0 lg:space-y-3 xl:space-y-0">
              <div className='flex space-x-6'>
                {practitioner.rate?
                <div>
                  <p className="text-sm text-gray-600">Fees start at</p>
                  <p className="text-xl font-semibold text-primary">${practitioner.rate}</p>
                </div>: ''}
                <div>
                  {/* <p className="text-sm text-gray-600">Next available at</p> */}
                  <p className="text-sm text-gray-900">{practitioner.nextAvailable}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Loading Component for UserCard
const UserCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6 w-full animate-pulse">
      {/* Mobile Layout (below xs) */}
      <div className="xs:hidden space-y-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0 w-full aspect-square p-2">
          <div className="w-full h-full rounded-lg bg-gray-200"></div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {/* Specialty */}
          <div className="text-center">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>

          {/* Name */}
          <div className="text-center">
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>

          {/* Degrees */}
          <div className="text-center">
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>

          {/* Address */}
          <div className="flex items-start justify-center space-x-1">
            <div className="w-4 h-4 bg-gray-200 rounded mt-0.5"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>

          {/* Clinic */}
          <div className="flex items-start justify-center space-x-1">
            <div className="w-4 h-4 bg-gray-200 rounded mt-0.5"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-1"></div>
              <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
          </div>
          <div className="w-full h-10 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Medium Layout (xs to md) */}
      <div className="hidden xs:flex md:hidden items-stretch space-x-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0 w-[180px] p-2">
          <div className="w-full h-full rounded-lg bg-gray-200"></div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-[180px]">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-auto pt-2 border-t border-gray-100">
            <div className="flex xs:flex-col sm:flex-row items-center justify-between">
              <div className='flex space-x-4'>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="w-full sm:w-20 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout (md and above) */}
      <div className="hidden md:flex items-stretch space-x-4">
        {/* Profile Image */}
        <div className="relative flex-shrink-0 w-[250px] p-2">
          <div className="w-full h-full rounded-lg bg-gray-200"></div>
        </div>

        {/* Main Info */}
        <div className="flex-1 flex flex-col min-h-[250px]">
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="flex flex-row justify-between items-start">
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row sm:items-center lg:items-start xl:items-center sm:justify-between lg:justify-start xl:justify-between space-y-3 sm:space-y-0 lg:space-y-3 xl:space-y-0">
              <div className='flex space-x-6'>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-200 rounded-full w-36"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const reviewOptions = [
  { value: '', label: 'All Reviews' },
  { value: '4+', label: '4+ Stars' },
  { value: '4.5+', label: '4.5+ Stars' },
  { value: '5', label: '5 Stars Only' },
];

const checkOptions = [
  { value: '', label: 'All Checks' },
  { value: 'verified', label: 'Verified Only' },
  { value: 'insurance', label: 'Insurance Accepted' },
];

const sortOptions = [
  { value: 'rate', label: 'Rate (Low to High)' },
  // { value: 'created_at', label: 'Recently Added' },
  { value: 'full_name', label: 'Name (A-Z)' },
  // { value: 'specialty', label: 'Specialty' },
];

// Create state options from states-us package
const stateOptions = [
  { value: '', label: 'All States' },
  ...states.map(state => ({
    value: state.name,
    label: state.name
  }))
];

// Custom styles for React Select
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    padding: '0.125rem',
    boxShadow: state.isFocused ? '0 0 0 2px #EA7D00' : 'none',
    borderColor: state.isFocused ? '#EA7D00' : '#d1d5db',
    '&:hover': {
      borderColor: '#EA7D00',
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#EA7D00' : state.isFocused ? '#FEF3E7' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:hover': {
      backgroundColor: state.isSelected ? '#EA7D00' : '#FEF3E7',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6b7280',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#374151',
  }),
};

const UserDirectoryContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth(); // Get current authenticated user
  // Use the Supabase hook with pagination
  const { practitioners: supabaseUsers, loading, error, pagination, fetchPractitioners } = usePractitionersDirectory();
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [_specialties, setSpecialties] = useState<Specialty[]>([]);
  const [specialtyOptions, setSpecialtyOptions] = useState([{ value: '', label: 'All Specialties' }]);
  const [selectedSpecialty, setSelectedSpecialty] = useState({ value: '', label: 'All Specialties' });
  const [selectedReview, setSelectedReview] = useState(reviewOptions[0]);
  const [selectedCheck, setSelectedCheck] = useState(checkOptions[0]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedState, setSelectedState] = useState(() => {
    const locationParam = searchParams.get('location');
    if (locationParam) {
      // Try to find matching state
      const matchingState = stateOptions.find(state =>
        state.label.toLowerCase().includes(locationParam.toLowerCase())
      );
      return matchingState || { value: '', label: 'All States' };
    }
    return { value: '', label: 'All States' };
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMapSidebar, setShowMapSidebar] = useState(false);
  const [availableToday, setAvailableToday] = useState(true);
  const [selectedMapUser, setSelectedMapUser] = useState(null);
  const [geocodedLocations, setGeocodedLocations] = useState(new Map());

  // Fetch specialties from API
  const fetchSpecialties = async () => {
    try {
      const response = await fetch('/api/specialty');
      if (response.ok) {
        const result = await response.json();
        const apiSpecialties = result.data || [];
        setSpecialties(apiSpecialties);

        // Transform API data to React Select format
        const options = [
          { value: '', label: 'All Specialties' },
          ...apiSpecialties.map((specialty: Specialty) => ({
            value: specialty.title.toLowerCase(),
            label: specialty.title
          }))
        ];
        setSpecialtyOptions(options);
      }
    } catch (error) {
      console.error('Error fetching specialties:', error);
      // Fallback to empty options if API fails
      setSpecialtyOptions([{ value: '', label: 'All Specialties' }]);
    }
  };

  // Fetch specialties on component mount
  useEffect(() => {
    fetchSpecialties();
  }, []);

  // Set specialty filter when specialty options are loaded and there's a specialty URL parameter
  useEffect(() => {
    const specialtyParam = searchParams.get('specialty');
    if (specialtyParam && specialtyOptions.length > 1) { // length > 1 means options are loaded
      // Try to find exact match first (for dropdown selections)
      const exactMatch = specialtyOptions.find(option =>
        option.value.toLowerCase() === specialtyParam.toLowerCase() ||
        option.label.toLowerCase() === specialtyParam.toLowerCase()
      );

      if (exactMatch) {
        setSelectedSpecialty(exactMatch);
      } else {
        // If no exact match found (e.g., condition name), keep "All Specialties" selected
        // The search will still work as it searches within practitioners' specialty fields
        setSelectedSpecialty({ value: '', label: 'All Specialties' });
      }
    }
  }, [specialtyOptions, searchParams]);

  // Trigger search when component loads with search parameters
  useEffect(() => {
    const searchParam = searchParams.get('search');
    const locationParam = searchParams.get('location');
    const specialtyParam = searchParams.get('specialty');

    if (searchParam || locationParam || specialtyParam) {
      // Use specialty param directly if available, otherwise use selected dropdown value
      const specialtyValue = specialtyParam || (selectedSpecialty?.value === '' ? undefined : selectedSpecialty?.value);

      console.log('Frontend search params:', {
        search: searchParam,
        location: selectedState?.value,
        specialty: specialtyValue,
        originalSpecialtyParam: specialtyParam
      });

      // Trigger search with the URL parameters
      fetchPractitioners({
        page: 1,
        limit: 3,
        search: searchParam || '',
        location: selectedState?.value || '',
        specialty: specialtyValue,
        sortBy: sortBy?.value,
        order: sortBy?.value === 'rate' ? 'asc' : 'desc'
      });
    }
  }, [searchParams, selectedState, selectedSpecialty, fetchPractitioners, sortBy?.value]);

  // Google Maps configuration
  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const defaultCenter = useMemo(() => ({
    lat: 49.2827, // Vancouver, BC coordinates (fallback only)
    lng: -123.1207
  }), []);

  // Transform Supabase data to match the expected format
  const practitioners = useMemo(() => {
    if (!supabaseUsers || supabaseUsers.length === 0) {
      return [];
    }

    const transformed = supabaseUsers.map((practitioner) => ({
      ...practitioner,
      avatar: {
        url: getAvatarUrl(practitioner.avatar),
        alt: practitioner.full_name || "Practitioner"
      },
      degree: practitioner.degree || '',
      languages: Array.isArray(practitioner.languages) ? practitioner.languages : ['English'],
      clinic: practitioner.clinic || 'Private Practice',
      address: practitioner.address || 'Address not available',
      specialty: practitioner.specialty || '',
      rate: practitioner.rate,
      reviews: practitioner.reviews || 0, // Use actual reviews from database
      rating: practitioner.rating || 0, // Add separate rating field
      experience: `${Math.floor(Math.random() * 20) + 80}% (${Math.floor(Math.random() * 300) + 100} / ${Math.floor(Math.random() * 350) + 150} Visits)`,
      nextAvailable: `${Math.floor(Math.random() * 12) + 8}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'} - ${Math.floor(Math.random() * 28) + 1} ${['Jan', 'Feb', 'Mar', 'Apr', 'May'][Math.floor(Math.random() * 5)]}`,
      yearsExp: `${Math.floor(Math.random() * 15) + 5} Years of Experience`
    }));
    return transformed;
  }, [supabaseUsers]);

  // Filter and search functionality
  const filteredUsers = useMemo(() => {
    return practitioners.filter(practitioner => {
      // Search functionality
      const formattedSpecialty = formatSpecialties(practitioner.specialty);
      const matchesSearch = searchQuery === '' || 
        (practitioner.full_name && practitioner.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (formattedSpecialty && formattedSpecialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (practitioner.clinic && practitioner.clinic.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // State filter
      const matchesLocation = selectedState?.value === '' ||
        (practitioner.address && practitioner.address.toLowerCase().includes(selectedState?.value.toLowerCase())) ||
        (practitioner.clinic && practitioner.clinic.toLowerCase().includes(selectedState?.value.toLowerCase()));
      
      // Specialty filter
      const matchesSpecialty = selectedSpecialty?.value === '' ||
        (formattedSpecialty && formattedSpecialty.toLowerCase().includes(selectedSpecialty?.value.toLowerCase()));
      
      // Review filter (simplified for demo)
      const matchesReview = selectedReview?.value === '' || true;
      
      return matchesSearch && matchesLocation && matchesSpecialty && matchesReview;
    });
  }, [practitioners, searchQuery, selectedState, selectedSpecialty, selectedReview]);

  // Function to geocode addresses using Google Geocoding API
  const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
    try {
      if (typeof window === 'undefined' || !window.google) {
        return null;
      }

      const geocoder = new window.google.maps.Geocoder();
      
      return new Promise((resolve) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              lat: location.lat(),
              lng: location.lng()
            });
          } else {
            console.warn(`Geocoding failed for address: ${address}, status: ${status}`);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  // Effect to geocode practitioner addresses
  useEffect(() => {
    const geocodePractitioners = async () => {
      if (!filteredUsers.length || typeof window === 'undefined' || !window.google) {
        return;
      }

      const newGeocodedLocations = new Map(geocodedLocations);
      const addressesToGeocode = filteredUsers
        .filter(p => p.address && p.address.trim() !== '' && !newGeocodedLocations.has(p.address))
        .map(p => p.address);

      if (addressesToGeocode.length === 0) return;

      // Geocode addresses in batches to avoid rate limiting
      for (const address of addressesToGeocode) {
        const coordinates = await geocodeAddress(address);
        if (coordinates) {
          newGeocodedLocations.set(address, coordinates);
        }
        // Small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setGeocodedLocations(newGeocodedLocations);
    };

    // Delay execution to ensure Google Maps is loaded
    const timer = setTimeout(geocodePractitioners, 1000);
    return () => clearTimeout(timer);
  }, [filteredUsers, geocodedLocations]);

  // Function to get user locations with real coordinates
  const generateUserLocations = useMemo(() => {
    return filteredUsers
      .filter(practitioner => {
        // Only include practitioners with addresses that have been successfully geocoded
        return practitioner.address && 
               practitioner.address.trim() !== '' && 
               geocodedLocations.has(practitioner.address);
      })
      .map((practitioner) => {
        const coordinates = geocodedLocations.get(practitioner.address);
        
        return {
          ...practitioner,
          coordinates
        };
      });
  }, [filteredUsers, geocodedLocations]);

  // Calculate center and zoom based on actual practitioner locations
  const mapSettings = useMemo(() => {
    if (generateUserLocations.length === 0) {
      return { center: defaultCenter, zoom: 12 }; // Fallback to Vancouver if no practitioners with locations
    }

    // Calculate the center point of all user locations
    const totalLat = generateUserLocations.reduce((sum, practitioner) => 
      sum + practitioner.coordinates.lat, 0);
    const totalLng = generateUserLocations.reduce((sum, practitioner) => 
      sum + practitioner.coordinates.lng, 0);

    const center = {
      lat: totalLat / generateUserLocations.length,
      lng: totalLng / generateUserLocations.length
    };

    // Calculate appropriate zoom level based on the spread of locations
    if (generateUserLocations.length === 1) {
      return { center, zoom: 15 }; // Closer zoom for single location
    }

    // Calculate bounds to determine appropriate zoom
    const lats = generateUserLocations.map(p => p.coordinates.lat);
    const lngs = generateUserLocations.map(p => p.coordinates.lng);
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);

    // Adjust zoom based on spread of locations - zoom out a bit
    let zoom = 6;
    if (maxSpread < 0.01) zoom = 9;       // Very close locations
    else if (maxSpread < 0.05) zoom = 7;  // Close locations
    else if (maxSpread < 0.1) zoom = 6;   // Medium spread
    else if (maxSpread < 0.5) zoom = 4;   // Wide spread
    else zoom = 3;                        // Very wide spread

    return { center, zoom };
  }, [generateUserLocations, defaultCenter]);

  const mapCenter = mapSettings.center;
  const mapZoom = mapSettings.zoom;

  // Use the practitioners directly from the API (already paginated)
  const currentUsers = supabaseUsers;
  
  const handleSearch = () => {
    // Search with new parameters, reset to page 1
    handlePageChange(1);
  };

  // Handle pagination with API calls
  const handlePageChange = (page: number) => {
    const fetchParams = {
      page,
      limit: 3,
      search: searchQuery,
      location: selectedState?.value || '',
      specialty: selectedSpecialty?.value === 'All Specialties' ? undefined : selectedSpecialty?.value,
      sortBy: sortBy?.value,
    };

    fetchPractitioners(fetchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPractitioner = (practitioner) => {
    router.push(`/practitioner-details/${practitioner.id}`);
  };
  
  // Fixed function - now properly receives practitioner parameter
  const navigateToBooking = (practitioner) => {
    if (!practitioner || !practitioner.id) {
      console.error('Invalid practitioner data:', practitioner);
      return;
    }

    // Always redirect to practitioner detail page Services tab first
    router.push(`/practitioner-details/${practitioner.id}#services`);
  };

  const showOnMap = (practitioner, event) => {
    // Prevent triggering when clicking on buttons or links
    if (event?.target.closest('button') || event?.target.closest('a')) {
      return;
    }
    
    // Only show if the user has geocoded coordinates
    const userWithLocation = generateUserLocations.find(p => p.id === practitioner.id);
    if (userWithLocation) {
      setSelectedMapUser(practitioner.id);
      // Optional: scroll to map section on mobile
      if (window.innerWidth < 1024) { // lg breakpoint
        setShowMapSidebar(true);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const clearFilters = () => {
    setSelectedSpecialty(specialtyOptions[0]);
    setSelectedReview(reviewOptions[0]);
    setSelectedCheck(checkOptions[0]);
    setSearchQuery('');
    setSelectedState({ value: '', label: 'All States' });
    setAvailableToday(true);
    setShowMobileFilters(false);

    // Fetch with cleared filters
    handlePageChange(1);
  };

  return (
    <>
      <Breadcrumb pageName="Find A Practitioner" />
      <div className="min-h-screen bg-white">
        {/* Loading State */}
        {loading && (
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, index) => (
                <UserCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-700 mb-4">Error loading practitioners: {error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Main Content - Only show when not loading and no error */}
        {!loading && !error && (
        <>
        {/* Header Search Section */}
        <div className="font-sans">
          <div className="container mx-auto px-4 py-4 lg:py-6">
            {/* Mobile Search Layout */}
            <div className="block md:hidden space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search doctors, clinics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="w-full">
                <Select
                  value={selectedState}
                  onChange={(option) => setSelectedState(option)}
                  options={stateOptions}
                  styles={customSelectStyles}
                  placeholder="Select State..."
                  isSearchable
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                />
              </div>
              <button 
                onClick={handleSearch}
                className="w-full bg-primary text-white py-3 rounded-full hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Desktop Search Layout */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for Doctors, Hospitals, Clinics"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="w-64">
                <Select
                  value={selectedState}
                  onChange={(option) => setSelectedState(option)}
                  options={stateOptions}
                  styles={customSelectStyles}
                  placeholder="Select State..."
                  isSearchable
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="font-sans container mx-auto px-4 py-4 lg:py-6">
          {/* Mobile Filter and Map Buttons */}
          <div className="flex md:hidden justify-between items-center mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={() => setShowMapSidebar(!showMapSidebar)}
              className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg"
            >
              <MapPin className="w-4 h-4" />
              <span>Map</span>
            </button>
          </div>

          {/* Results Header */}
          <div className="flex flex-col xs:flex-row xs:items-center justify-between mb-6 space-y-3 xs:space-y-0">
            <h2 className="text-lg lg:text-xl font-semibold text-[#012047]">
              Showing <span className="text-[#822BD4]">{pagination?.totalCount || 0}</span> Doctors For You (Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1})
            </h2>
            <div className="flex flex-col xs:flex-row xs:items-center space-y-2 xs:space-y-0 xs:space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort By:</span>
                <div className="w-48">
                  <Select
                    value={sortBy}
                    onChange={(option) => {
                      setSortBy(option);
                      const order = (option?.value === 'rate') ? 'asc' : 
                                   (option?.value === 'full_name') ? 'asc' : 'desc';
                      fetchPractitioners({
                        page: 1,
                        limit: 3,
                        search: searchQuery,
                        location: selectedState?.value || '',
                        specialty: selectedSpecialty?.value === '' ? undefined : selectedSpecialty?.value,
                        sortBy: option?.value,
                        order: order
                      });
                    }}
                    options={sortOptions}
                    styles={customSelectStyles}
                    isSearchable={false}
                    placeholder="Sort by..."
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Desktop Filters */}
              <div className='hidden md:block'>
                <div className="grid grid-cols-10 gap-4 mb-4">
                  <div className="col-span-3">
                    <Select
                      value={selectedSpecialty}
                      onChange={(option) => {
                        setSelectedSpecialty(option);
                        fetchPractitioners({
                          page: 1,
                          limit: 3,
                          search: searchQuery,
                          location: selectedState?.value || '',
                          specialty: option?.value === '' ? undefined : option?.value,
                          sortBy: sortBy?.value,
                          order: sortBy?.value === 'rate' ? 'asc' : 'desc'
                        });
                      }}
                      options={specialtyOptions}
                      styles={customSelectStyles}
                      placeholder="Select Specialty..."
                      isSearchable
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                    />
                  </div>
                  <div className="col-span-3">
                    <Select
                      value={selectedReview}
                      onChange={(option) => {
                        setSelectedReview(option);
                        fetchPractitioners({
                          page: 1,
                          limit: 3,
                          search: searchQuery,
                          location: selectedState?.value || '',
                          specialty: selectedSpecialty?.value === '' ? undefined : selectedSpecialty?.value,
                          sortBy: sortBy?.value,
                          order: sortBy?.value === 'rate' ? 'asc' : 'desc'
                        });
                      }}
                      options={reviewOptions}
                      styles={customSelectStyles}
                      placeholder="Select Reviews..."
                      isSearchable={false}
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                    />
                  </div>
                  <div className="col-span-3">
                    <Select
                      value={selectedCheck}
                      onChange={(option) => {
                        setSelectedCheck(option);
                        fetchPractitioners({
                          page: 1,
                          limit: 3,
                          search: searchQuery,
                          location: selectedState?.value || '',
                          specialty: selectedSpecialty?.value === '' ? undefined : selectedSpecialty?.value,
                          sortBy: sortBy?.value,
                          order: sortBy?.value === 'rate' ? 'asc' : 'desc'
                        });
                      }}
                      options={checkOptions}
                      styles={customSelectStyles}
                      placeholder="Select Checks..."
                      isSearchable={false}
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <button onClick={clearFilters} className="text-primary text-sm hover:underline whitespace-nowrap">
                      Clear All
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm text-gray-600">Availability</span>
                  <Switch
                    checked={availableToday}
                    onChange={setAvailableToday}
                    onColor="#8ED083"
                    offColor="#E5E7EB"
                    onHandleColor="#ffffff"
                    offHandleColor="#ffffff"
                    handleDiameter={24}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                    height={24}
                    width={48}
                    className="react-switch"
                  />
                </div>
              </div>

              {/* Mobile Filters Modal */}
              <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ease-in-out ${
                showMobileFilters ? 'visible opacity-100' : 'invisible opacity-0'
              }`}>
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out" 
                  onClick={() => setShowMobileFilters(false)}
                ></div>
                <div className={`fixed inset-x-4 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-xl max-h-[80vh] overflow-y-auto transition-all duration-300 ease-in-out ${
                  showMobileFilters ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Filter Results</h3>
                    <button 
                      onClick={() => setShowMobileFilters(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* Modal Content */}
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                      <Select
                        value={selectedSpecialty}
                        onChange={(option) => {
                          setSelectedSpecialty(option);
                          fetchPractitioners({
                            page: 1,
                            limit: 3,
                            search: searchQuery,
                            location: selectedState?.value || '',
                            specialty: option?.value === '' ? undefined : option?.value,
                            sortBy: sortBy?.value,
                            order: sortBy?.value === 'rate' ? 'asc' : 'desc'
                          });
                        }}
                        options={specialtyOptions}
                        styles={customSelectStyles}
                        placeholder="Select Specialty..."
                        isSearchable
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reviews</label>
                      <Select
                        value={selectedReview}
                        onChange={(option) => {
                          setSelectedReview(option);
                          fetchPractitioners({
                            page: 1,
                            limit: 3,
                            search: searchQuery,
                            location: selectedState?.value || '',
                            specialty: selectedSpecialty?.value === '' ? undefined : selectedSpecialty?.value,
                            sortBy: sortBy?.value,
                            order: sortBy?.value === 'rate' ? 'asc' : 'desc'
                          });
                        }}
                        options={reviewOptions}
                        styles={customSelectStyles}
                        placeholder="Select Reviews..."
                        isSearchable={false}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Checks</label>
                      <Select
                        value={selectedCheck}
                        onChange={(option) => {
                          setSelectedCheck(option);
                          fetchPractitioners({
                            page: 1,
                            limit: 3,
                            search: searchQuery,
                            location: selectedState?.value || '',
                            specialty: selectedSpecialty?.value === '' ? undefined : selectedSpecialty?.value,
                            sortBy: sortBy?.value,
                            order: sortBy?.value === 'rate' ? 'asc' : 'desc'
                          });
                        }}
                        options={checkOptions}
                        styles={customSelectStyles}
                        placeholder="Select Checks..."
                        isSearchable={false}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Availability</span>
                      <Switch
                        checked={availableToday}
                        onChange={setAvailableToday}
                        onColor="#8ED083"
                        offColor="#E5E7EB"
                        onHandleColor="#ffffff"
                        offHandleColor="#ffffff"
                        handleDiameter={24}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                        height={24}
                        width={48}
                        className="react-switch"
                      />
                    </div>
                  </div>
                  
                  {/* Modal Footer */}
                  <div className="flex space-x-3 p-4 border-t border-gray-200">
                    <button 
                      onClick={clearFilters} 
                      className="flex-1 text-primary border border-primary py-3 px-4 rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                    >
                      Clear All
                    </button>
                    <button 
                      onClick={() => setShowMobileFilters(false)} 
                      className="flex-1 bg-primary text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* User Cards - Using the reusable component */}
              <div className="space-y-4">
                {currentUsers.map((practitioner) => (
                  <div
                    key={practitioner.id}
                    className="cursor-pointer"
                    onClick={(e) => {
                      // Show practitioner on map when clicking card
                      showOnMap(practitioner, e);
                    }}
                  >
                    <UserCard
                      practitioner={practitioner}
                      onNavigate={navigateToPractitioner}
                      onBooking={navigateToBooking}
                      isOwnProfile={user?.id === practitioner.id}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <button 
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-full ${
                          pagination.currentPage === page
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-100 flex-shrink-0">
              {/* Google Map */}
              <div className="bg-gray-100 rounded-lg h-full mb-6 relative overflow-hidden">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={mapZoom}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                  }}
                >
                  {generateUserLocations.map((practitioner) => (
                    <Marker
                      key={practitioner.id}
                      position={practitioner.coordinates}
                      title={practitioner.full_name}
                      onClick={() => setSelectedMapUser(practitioner.id)}
                    />
                  ))}
                  {selectedMapUser && (
                    <InfoWindow
                      position={generateUserLocations.find(p => p.id === selectedMapUser)?.coordinates || defaultCenter}
                      onCloseClick={() => setSelectedMapUser(null)}
                    >
                      <div className="p-0 max-w-sm bg-white rounded-xl shadow-lg overflow-hidden">
                        {(() => {
                          const practitioner = generateUserLocations.find(p => p.id === selectedMapUser);
                          if (!practitioner) return null;
                          return (
                            <div className="relative">
                              {/* Header with gradient background */}
                              <div className="bg-gradient-to-r from-primary/10 to-primary/20 p-4 relative">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <Image
                                      src={getAvatarUrl(practitioner.avatar)}
                                      alt={practitioner.full_name || "Practitioner"}
                                      width={60}
                                      height={60}
                                      className="rounded-full object-cover border-2 border-white shadow-md"
                                    />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-base mb-1">
                                      {practitioner.full_name}
                                    </h4>
                                    {practitioner.title && (
                                      <p className="text-sm text-primary font-medium mb-1">
                                        {practitioner.title}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={`w-3 h-3 ${
                                              practitioner.rating > 0 && star <= Math.floor(practitioner.rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm font-medium text-gray-700">
                                        {practitioner.rating > 0 ? practitioner.rating.toFixed(1) : ''}
                                        {practitioner.reviews > 0 ? ` (${practitioner.reviews} reviews)` : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Content */}
                              <div className="p-4 space-y-3">
                                {practitioner.specialty && (
                                  <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4 text-primary" />
                                    <span className="text-sm text-gray-700 font-medium">
                                      {formatSpecialties(practitioner.specialty)}
                                    </span>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-600 truncate">
                                    {practitioner.address}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">
                                    {practitioner.phone ? formatPhoneNumber(practitioner.phone) : 'Available for booking'}
                                  </span>
                                </div>

                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex gap-2 p-4 pt-0">
                                <button 
                                  onClick={() => {
                                    setSelectedMapUser(null);
                                    router.push(`/practitioner-details/${practitioner.id}`);
                                  }}
                                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                  View Profile
                                </button>
                                <button 
                                  onClick={() => setSelectedMapUser(null)}
                                  className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </div>
            </div>

            {/* Mobile Map Sidebar */}
            <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-800 ease-in-out ${
              showMapSidebar ? 'visible opacity-100' : 'invisible opacity-0'
            }`}>
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-800 ease-in-out" 
                onClick={() => setShowMapSidebar(false)}
              ></div>
              <div className={`fixed right-0 top-0 h-dvh w-full bg-white shadow-xl transform transition-transform duration-800 ease-in-out ${
                showMapSidebar ? 'translate-x-0' : 'translate-x-full'
              }`}>
                    <div className="p-4 pt-24">
                      <div className="flex items-center justify-end mb-4">
                        <button onClick={() => setShowMapSidebar(false)}>
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Google Map */}
                      <div className="bg-gray-100 rounded-lg h-[calc(100dvh-10rem)] relative overflow-hidden">
                        <GoogleMap
                          mapContainerStyle={{width: '100%', height: '100%'}}
                          center={mapCenter}
                          zoom={mapZoom}
                          options={{
                            streetViewControl: false,
                            mapTypeControl: false,
                            fullscreenControl: false,
                          }}
                        >
                          {generateUserLocations.map((practitioner) => (
                            <Marker
                              key={practitioner.id}
                              position={practitioner.coordinates}
                              title={practitioner.full_name}
                              onClick={() => setSelectedMapUser(practitioner.id)}
                            />
                          ))}
                          {selectedMapUser && (
                            <InfoWindow
                              position={generateUserLocations.find(p => p.id === selectedMapUser)?.coordinates || defaultCenter}
                              onCloseClick={() => setSelectedMapUser(null)}
                            >
                              <div className="p-0 max-w-xs bg-white rounded-xl shadow-lg overflow-hidden">
                                {(() => {
                                  const practitioner = generateUserLocations.find(p => p.id === selectedMapUser);
                                  if (!practitioner) return null;
                                  return (
                                    <div className="relative">
                                      {/* Header with gradient background */}
                                      <div className="bg-gradient-to-r from-primary/10 to-primary/20 p-3 relative">
                                        <div className="flex items-center gap-2">
                                          <div className="relative">
                                            <Image
                                              src={getAvatarUrl(practitioner.avatar)}
                                              alt={practitioner.full_name || "Practitioner"}
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
                                            <div className="flex items-center gap-1">
                                              <div className="flex items-center">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                  <Star
                                                    key={star}
                                                    className={`w-2.5 h-2.5 ${
                                                      practitioner.rating > 0 && star <= Math.floor(practitioner.rating)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                    }`}
                                                  />
                                                ))}
                                              </div>
                                              <span className="text-xs font-medium text-gray-700">
                                                {practitioner.rating > 0 ? `${practitioner.rating} (${practitioner.reviews} reviews)` : 'No reviews'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Content */}
                                      <div className="p-3 space-y-2">
                                        {practitioner.specialty && (
                                          <div className="flex items-center gap-2">
                                            <Building className="w-3 h-3 text-primary" />
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
                                      </div>
                                      
                                      {/* Action buttons */}
                                      <div className="flex gap-2 p-3 pt-0">
                                        <button 
                                          onClick={() => {
                                            setSelectedMapUser(null);
                                            setShowMapSidebar(false);
                                            router.push(`/practitioner-details/${practitioner.id}`);
                                          }}
                                          className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                          View Profile
                                        </button>
                                        <button 
                                          onClick={() => setSelectedMapUser(null)}
                                          className="px-2 py-2 border border-gray-300 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </InfoWindow>
                          )}
                        </GoogleMap>
                      </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Modal for User Details */}
          {isModalOpen && selectedUser && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={closeModal}
            >
              <div 
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {selectedUser.full_name}
                  </h2>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </>
  );
};

const UserDirectory = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <UserDirectoryContent />
    </Suspense>
  );
};

export default UserDirectory;