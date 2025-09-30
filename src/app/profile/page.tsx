"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import { useSpecialty } from "@/hooks/useSpecialty";
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import 'react-phone-input-2/lib/style.css';
import { ProfileData } from '@/types/user';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic imports for browser-only components
const PhoneInput = dynamic(() => import('react-phone-input-2'), {
  ssr: false,
  loading: () => <div className="w-full h-12 bg-gray-100 animate-pulse rounded-lg"></div>
});

const LanguageSelector = dynamic(() => import('react-language-selector-lite'), {
  ssr: false,
  loading: () => <div className="w-full h-12 bg-gray-100 animate-pulse rounded-lg"></div>
});

const Autocomplete = dynamic(
  () => import('@react-google-maps/api').then(mod => ({ default: mod.Autocomplete })),
  {
    ssr: false,
    loading: () => <input 
      type="text" 
      placeholder="Loading address autocomplete..." 
      className="w-full px-3 py-3 border rounded-lg bg-gray-100 border-gray-300"
      disabled 
    />
  }
);

// Using ProfileData from centralized types

// Skeleton Loading Component for Profile Page
const ProfilePageSkeleton = () => {
  return (
    <div className="mt-30 font-sans min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="container mx-auto">
        {/* Tabbed Content Skeleton */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation Skeleton */}
          <div className="flex flex-wrap border-b overflow-x-auto">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="px-4 md:px-8 py-4 whitespace-nowrap"
              >
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>

          {/* Tab Content Skeleton */}
          <div className="p-6 md:p-8">
            <div className="space-y-8">
              {/* Profile Section Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Avatar Section */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <div className="relative mx-auto w-32 h-32 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                      </div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Sections Skeleton */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <div className="h-12 bg-gray-200 rounded w-32"></div>
                <div className="h-12 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const { specialties, loading: specialtiesLoading, error: specialtiesError } = useSpecialty();
  const { updateProfile, isUpdating } = useProfile();
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [activeTab, setActiveTab] = useState('Profile');
  const [isClient, setIsClient] = useState(false);
  
  // Client-side only state initialization
  useEffect(() => {
    setIsClient(true);
    
    // URL parameter handling - only run on client
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get('section');
      if (section && ['info', 'availability', 'services', 'reviews', 'books', 'media'].includes(section)) {
        setActiveTab(
          section === 'info' ? 'Profile' :
          section === 'availability' ? 'Availability' :
          section === 'services' ? 'Services' :
          section === 'reviews' ? 'Reviews' :
          section === 'books' ? 'Books' :
          section === 'media' ? 'Media' : 'Profile'
        );
      }
    }
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const sectionMap = {
        'Profile': 'info',
        'Availability': 'availability',
        'Services': 'services',
        'Reviews': 'reviews',
        'Books': 'books',
        'Media': 'media'
      };
      const section = sectionMap[tab as keyof typeof sectionMap];

      // Create new URLSearchParams to avoid read-only issues
      const currentUrl = new URL(window.location.href);
      const newSearchParams = new URLSearchParams(currentUrl.search);
      newSearchParams.set('section', section);

      const newUrl = `${currentUrl.origin}${currentUrl.pathname}?${newSearchParams.toString()}`;
      window.history.pushState(null, '', newUrl);
    }
  };
  
  // Updated availability state for date-based system
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());
  const [dateAvailability, setDateAvailability] = useState<{[key: string]: {[key: string]: boolean}}>({});
  const [loadingDateAvailability, setLoadingDateAvailability] = useState(false);
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [serviceRates, setServiceRates] = useState<{[key: string]: number}>({});
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [isSavingServices, setIsSavingServices] = useState(false);
  const [isEditingReviews, setIsEditingReviews] = useState(false);
  const [isSavingReviews, setIsSavingReviews] = useState(false);
  const [reviewsInput, setReviewsInput] = useState('');

  // Patient booking states
  const [patientBookings, setPatientBookings] = useState<{[key: string]: any[]}>({});
  const [selectedBookingDate, setSelectedBookingDate] = useState<Date>(new Date());
  const [currentBookingCalendarDate, setCurrentBookingCalendarDate] = useState<Date>(new Date());
  const [loadingPatientBookings, setLoadingPatientBookings] = useState(false);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any>(null);

  // Media upload states
  const [uploadingVideo, _setUploadingVideo] = useState(false);
  const [uploadingImages, _setUploadingImages] = useState(false);

  // Staged media (unsaved changes) - files held in memory until save
  const [stagedVideoFile, setStagedVideoFile] = useState<File | null>(null);
  const [stagedVideoUrl, setStagedVideoUrl] = useState<string | null>(null); // For preview
  const [stagedImages, setStagedImages] = useState<Array<{ url: string; file?: File; isNew: boolean }>>([]); // Track both URLs and files with metadata
  const [hasUnsavedMediaChanges, setHasUnsavedMediaChanges] = useState(false);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [imagesWereModified, setImagesWereModified] = useState(false); // Track if user made any image changes

  // Combined media for display (staged takes priority over saved)
  const mediaVideo = stagedVideoUrl === 'DELETED' ? null : (stagedVideoUrl || profile?.video || null);

  // For images, we need to merge existing images with staged changes
  const getDisplayImages = () => {
    if (stagedImages.length > 0) {
      // If we have staged changes, show all staged images (which includes existing + new)
      return stagedImages.map(img => img.url);
    }
    // If no staged changes, show saved images
    return profile?.images ? JSON.parse(profile.images) : [];
  };
  const mediaImages = getDisplayImages();

  // Different tabs for practitioners vs patients
  const tabs = profile?.user_type === 'practitioner'
    ? ['Profile', 'Availability', 'Services', 'Reviews', 'Media']
    : ['Profile', 'Books']; // Patients see Profile and Books tabs


  const availableDegrees = [
    'MD - Doctor of Medicine',
    'DO - Doctor of Osteopathic Medicine',
    'DDS - Doctor of Dental Surgery',
    'DMD - Doctor of Medicine in Dentistry',
    'PharmD - Doctor of Pharmacy',
    'DPT - Doctor of Physical Therapy',
    'DNP - Doctor of Nursing Practice',
    'PhD - Doctor of Philosophy',
    'PsyD - Doctor of Psychology',
    'OD - Doctor of Optometry',
    'DPM - Doctor of Podiatric Medicine',
    'DC - Doctor of Chiropractic',
    'DVM - Doctor of Veterinary Medicine',
    'MS - Master of Science',
    'MSN - Master of Science in Nursing',
    'MPH - Master of Public Health',
    'MBA - Master of Business Administration',
    'BSN - Bachelor of Science in Nursing',
    'RN - Registered Nurse',
    'NP - Nurse Practitioner',
    'PA - Physician Assistant',
    'Other'
  ];

  // Custom styles for React Select
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      padding: '0.25rem',
      minHeight: '48px',
      boxShadow: state.isFocused ? '0 0 0 2px #10b981' : 'none',
      borderColor: state.isFocused ? '#10b981' : '#d1d5db',
      backgroundColor: state.isDisabled ? '#f3f4f6' : 'white',
      cursor: state.isDisabled ? 'not-allowed' : 'default',
      '&:hover': {
        borderColor: state.isDisabled ? '#d1d5db' : '#10b981',
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#d1fae5' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#10b981' : '#d1fae5',
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6b7280',
    }),
    singleValue: (provided: any, state: any) => ({
      ...provided,
      color: state.isDisabled ? '#6b7280' : '#374151',
    }),
  };

  // Animated components for multi-select
  const animatedComponents = makeAnimated();

  const handleLanguageSelect = (language) => {
    if (language && language.name && !profile.languages.includes(language.name)) {
      const newLanguages = [...profile.languages, language.name];
      handleInputChange('languages', newLanguages);
    }
  };

  // Media upload handler functions (staged upload)
  const handleVideoUpload = (file: File | undefined) => {
    if (!file || !user) return;

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast.error('Video file size must be less than 50MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Clean up old preview URL
    if (stagedVideoUrl) {
      URL.revokeObjectURL(stagedVideoUrl);
    }

    // Create preview URL and stage the file
    const previewUrl = URL.createObjectURL(file);
    setStagedVideoFile(file);
    setStagedVideoUrl(previewUrl);
    setHasUnsavedMediaChanges(true);
  };

  const handleImagesUpload = (files: File[]) => {
    if (!files.length || !user) return;

    // Validate each file
    const maxSize = 10 * 1024 * 1024; // 10MB per image
    for (const file of files) {
      if (file.size > maxSize) {
        toast.error('Each image file must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select only image files');
        return;
      }
    }

    // If this is the first upload and we have no staged images, initialize with existing images
    if (stagedImages.length === 0 && profile?.images) {
      const existingImages = JSON.parse(profile.images).map((url: string) => ({
        url: url,
        file: undefined,
        isNew: false
      }));
      setStagedImages(existingImages);
    }

    // Create preview URLs and stage the files
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file: file,
      isNew: true
    }));

    // Add new images to staged images (existing + new)
    setStagedImages(prev => [...prev, ...newImages]);
    setHasUnsavedMediaChanges(true);
    setImagesWereModified(true);
  };



  // Drag and drop handlers for image reordering



  // Default time slots configuration
  const defaultTimeSlots = useMemo(() => [
    '08:00', '09:00', '10:00', '11:00', // Morning: 8-12 (4 slots)
    '14:00', '15:00', '16:00', '17:00'  // Afternoon: 2-6 (4 slots)
  ], []);

  // Calendar helper functions
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const generateCalendarDates = () => {
    const firstDay = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
    const lastDay = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    
    // Start from the Sunday of the week containing the first day
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    const dates = [];
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay())); // End on Saturday
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentCalendarDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentCalendarDate(newDate);
  };

  const getMonthYearString = () => {
    return currentCalendarDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === currentCalendarDate.getMonth() && 
           date.getFullYear() === currentCalendarDate.getFullYear();
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Helper function to format date without timezone issues
  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isDateToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Patient booking calendar helper functions
  const generatePatientBookingCalendarDates = () => {
    const firstDay = new Date(currentBookingCalendarDate.getFullYear(), currentBookingCalendarDate.getMonth(), 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const dates = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  const navigatePatientBookingMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentBookingCalendarDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentBookingCalendarDate(newDate);
  };

  const getPatientBookingMonthYearString = () => {
    return currentBookingCalendarDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const isDateInCurrentBookingMonth = (date: Date) => {
    return date.getMonth() === currentBookingCalendarDate.getMonth() &&
           date.getFullYear() === currentBookingCalendarDate.getFullYear();
  };

  const isBookingDateSelected = (date: Date) => {
    return date.toDateString() === selectedBookingDate.toDateString();
  };

  // State for storing booking details
  const [bookingDetails, setBookingDetails] = useState<{[key: string]: any[]}>({});

  // Modal state for booking details
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBookingInfo, setSelectedBookingInfo] = useState<any>(null);

  // Handle clicking on a booked time slot
  const handleBookedSlotClick = (timeSlot: string) => {
    const dateStr = formatDateForAPI(selectedDate);
    const dayBookings = bookingDetails[dateStr] || [];
    const booking = dayBookings.find(booking => booking.time === timeSlot);

    if (booking) {
      setSelectedBookingInfo(booking);
      setShowBookingModal(true);
    }
  };

  // Close booking modal
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedBookingInfo(null);
  };

  // Helper function to get patient avatar URL with fallback
  const getPatientAvatarUrl = (booking: any) => {
    if (booking.patient?.avatar) {
      return booking.patient.avatar;
    }
    return 'https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg';
  };

  // Helper function to get practitioner avatar URL with fallback (for patient bookings view)
  const getPractitionerAvatarUrl = (booking: any) => {
    if (booking.practitioner?.avatar) {
      return booking.practitioner.avatar;
    }
    return 'https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg';
  };

  // Helper function to get patient bookings for a specific date
  const getPatientBookingsForDate = useCallback(async (date: Date) => {
    if (!user) return {};

    setLoadingPatientBookings(true);
    try {
      const dateStr = formatDateForAPI(date);

      // Fetch patient bookings
      const response = await fetch(`/api/bookings?patient_id=${user.id}&date=${dateStr}`).catch(() => null);

      let bookings = [];
      if (response && response.ok) {
        try {
          const result = await response.json();
          bookings = result.bookings || [];
        } catch (error) {
          console.warn('Error parsing patient bookings response:', error);
          bookings = [];
        }
      } else {
        console.warn('Patient bookings API not available or returned error');
        bookings = [];
      }

      // Store booking details for display
      setPatientBookings(prev => ({
        ...prev,
        [dateStr]: bookings || []
      }));

      return bookings;
    } catch (error) {
      console.error('Error loading patient bookings for date:', error);
      return [];
    } finally {
      setLoadingPatientBookings(false);
    }
  }, [user, setLoadingPatientBookings, setPatientBookings]);

  // Handle clicking on a patient booking slot
  const handlePatientBookingClick = (booking: any) => {
    setSelectedBookingDetails(booking);
    setShowBookingDetailsModal(true);
  };

  // Close patient booking details modal
  const closePatientBookingModal = () => {
    setShowBookingDetailsModal(false);
    setSelectedBookingDetails(null);
  };

  // Helper function to get availability for a specific date (Books + Availabilities tables)
  const getAvailabilityForDate = useCallback(async (date: Date) => {
    if (!user) return {};

    setLoadingDateAvailability(true);
    try {
      const dateStr = formatDateForAPI(date);

      // Fetch bookings and manual availability blocks
      const bookingsResponse = await fetch(`/api/bookings?practitioner_id=${user.id}&date=${dateStr}&status=confirmed`).catch(() => null);

      let bookings = [];
      if (bookingsResponse && bookingsResponse.ok) {
        try {
          const result = await bookingsResponse.json();
          bookings = result.bookings || [];
        } catch (error) {
          console.warn('Error parsing bookings response:', error);
          bookings = [];
        }
      } else {
        console.warn('Bookings API not available or returned error, continuing without bookings data');
        bookings = [];
      }

      // Store booking details for display
      setBookingDetails(prev => ({
        ...prev,
        [dateStr]: bookings || []
      }));


      const dayAvailability: {[key: string]: boolean} = {};

      // Set availability - unavailable if booked OR blocked
      defaultTimeSlots.forEach(slot => {
        const booking = bookings ? bookings.find(b => b.time === slot) : null;
        if (booking) {
          // If there's any booking (patient or blocked), mark as unavailable
          dayAvailability[slot] = false;
        } else {
          // No booking, available by default
          dayAvailability[slot] = true;
        }
      });

      return dayAvailability;
    } catch (error) {
      console.error('Error loading availability for date:', error);
      // Return default availability on error
      const dayAvailability: {[key: string]: boolean} = {};
      defaultTimeSlots.forEach(slot => {
        dayAvailability[slot] = true;
      });
      return dayAvailability;
    } finally {
      setLoadingDateAvailability(false);
    }
  }, [user, setLoadingDateAvailability, setBookingDetails, defaultTimeSlots]);

  // Get current date's availability
  const getCurrentDateAvailability = () => {
    const dateStr = formatDateForAPI(selectedDate);
    return dateAvailability[dateStr] || {};
  };

  // Toggle availability for selected date (with booking constraint)
  const toggleDateAvailability = (timeSlot: string) => {
    const dateStr = formatDateForAPI(selectedDate);
    const currentAvailability = dateAvailability[dateStr] || {};
    const dayBookings = bookingDetails[dateStr] || [];

    // Check if this time slot has a patient booking (not a blocked slot)
    const slotBooking = dayBookings.find(booking => booking.time === timeSlot);
    const isPatientBooking = slotBooking && slotBooking.service_type !== 'blocked';

    if (isPatientBooking) {
      // If there's a booking, can't toggle this slot
      toast.error('Cannot modify this time slot because there is already a patient booking. To change availability for booked slots, please contact the patient to reschedule.');
      return;
    }

    // For all cases (blocked slots and regular unavailable), just toggle local state
    // The Save button will handle the actual database operations
    setDateAvailability(prev => ({
      ...prev,
      [dateStr]: {
        ...currentAvailability,
        [timeSlot]: !currentAvailability[timeSlot]
      }
    }));
  };

  // Save function to update manual blocks using Books table
  const handleAvailabilitySave = async () => {
    if (!user || !selectedDate) return;

    setIsSavingAvailability(true);
    try {
      const dateStr = formatDateForAPI(selectedDate);
      const currentAvailability = dateAvailability[dateStr] || {};

      // Get current bookings for this date
      const dayBookings = bookingDetails[dateStr] || [];
      const bookedSlots = dayBookings.filter(booking => booking.service_type !== 'blocked').map(booking => booking.time);
      const currentlyBlockedSlots = dayBookings.filter(booking => booking.service_type === 'blocked').map(booking => booking.time);

      // Determine which slots should be blocked (unavailable but not patient bookings)
      const shouldBeBlockedSlots = Object.entries(currentAvailability)
        .filter(([slot, isAvailable]) => !isAvailable && !bookedSlots.includes(slot))
        .map(([slot]) => slot);

      // Find slots to block (not currently blocked)
      const slotsToBlock = shouldBeBlockedSlots.filter(slot => !currentlyBlockedSlots.includes(slot));

      // Find slots to unblock (currently blocked but should be available)
      const slotsToUnblock = currentlyBlockedSlots.filter(slot => !shouldBeBlockedSlots.includes(slot));

      // Block new slots
      for (const timeSlot of slotsToBlock) {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            practitioner_id: user.id,
            date: dateStr,
            time: timeSlot,
            service_type: 'blocked'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to block ${timeSlot}: ${errorData.error}`);
        }
      }

      // Unblock slots (delete blocked entries)
      for (const timeSlot of slotsToUnblock) {
        // Find the blocked booking ID to delete
        const blockedBooking = dayBookings.find(booking =>
          booking.time === timeSlot && booking.service_type === 'blocked'
        );

        if (blockedBooking) {
          const response = await fetch(`/api/bookings?id=${blockedBooking.id}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.warn(`Failed to unblock ${timeSlot}:`, errorData.error);
          }
        }
      }

      // Refresh booking details to reflect changes
      const updatedAvailability = await getAvailabilityForDate(selectedDate);
      setDateAvailability(prev => ({
        ...prev,
        [dateStr]: updatedAvailability
      }));
    } catch (error) {
      console.error('Error saving availability:', error);
      setErrors({ general: 'Failed to save availability. Please try again.' });
    } finally {
      setIsSavingAvailability(false);
    }
  };

  // Update availability when selected date changes
  useEffect(() => {
    const loadSelectedDateAvailability = async () => {
      if (!user || !selectedDate || !isClient) return;
      
      const dateStr = formatDateForAPI(selectedDate);
      
      // Only load if not already cached
      if (!dateAvailability[dateStr]) {
        const dayAvailability = await getAvailabilityForDate(selectedDate);
        
        setDateAvailability(prev => ({
          ...prev,
          [dateStr]: dayAvailability
        }));
      }
    };
    
    loadSelectedDateAvailability();
  }, [selectedDate, user, isClient, dateAvailability, getAvailabilityForDate]);

  // Update patient bookings when selected booking date changes (for patients)
  useEffect(() => {
    const loadSelectedDatePatientBookings = async () => {
      if (!user || !selectedBookingDate || !isClient || profile?.user_type !== 'patient') return;

      const dateStr = formatDateForAPI(selectedBookingDate);

      // Only load if not already cached
      if (!patientBookings[dateStr]) {
        await getPatientBookingsForDate(selectedBookingDate);
      }
    };

    loadSelectedDatePatientBookings();
  }, [selectedBookingDate, user, isClient, profile?.user_type, patientBookings, getPatientBookingsForDate]);

  // Clean up preview URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (stagedVideoUrl) {
        URL.revokeObjectURL(stagedVideoUrl);
      }
      for (const image of stagedImages) {
        if (image.isNew && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      }
    };
  }, [previewUrl, stagedVideoUrl, stagedImages]);

  // Save staged media changes to database
  const handleSaveMedia = async () => {
    if (!user || !hasUnsavedMediaChanges) return;

    setIsSavingMedia(true);
    try {
      const updateData: any = {};

      // Upload video to storage if there's a staged file
      if (stagedVideoFile) {
        const fileExt = stagedVideoFile.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `user_videos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('kaizen')
          .upload(filePath, stagedVideoFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('kaizen')
          .getPublicUrl(filePath);

        updateData.video = publicUrl;

        // Delete old video if exists
        if (profile?.video) {
          const oldVideoPath = profile.video.split('/').slice(-2).join('/');
          supabase.storage.from('kaizen').remove([oldVideoPath]).catch(console.error);
        }
      } else if (stagedVideoUrl === 'DELETED' && profile?.video) {
        // Video was deleted
        updateData.video = null;
        const oldVideoPath = profile.video.split('/').slice(-2).join('/');
        supabase.storage.from('kaizen').remove([oldVideoPath]).catch(console.error);
      }

      // Handle images if user made image changes
      if (imagesWereModified) {
        const finalImages: string[] = [];
        const existingImages = profile?.images ? JSON.parse(profile.images) : [];

        // Process each staged image
        for (const stagedImage of stagedImages) {
          if (stagedImage.isNew && stagedImage.file) {
            // Upload new image
            const fileExt = stagedImage.file.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `user_images/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('kaizen')
              .upload(filePath, stagedImage.file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('kaizen')
              .getPublicUrl(filePath);

            finalImages.push(publicUrl);
          } else {
            // Keep existing image
            finalImages.push(stagedImage.url);
          }
        }

        updateData.images = finalImages.length > 0 ? JSON.stringify(finalImages) : null;

        // Delete old images that were removed
        const removedImages = existingImages.filter((img: string) => !finalImages.includes(img));
        for (const removedImg of removedImages) {
          const imagePath = removedImg.split('/').slice(-2).join('/');
          supabase.storage.from('kaizen').remove([imagePath]).catch(console.error);
        }
      }

      // Update database
      const { error } = await supabase
        .from('Users')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Update profile state
      setProfile(prev => prev ? { ...prev, ...updateData } : null);

      // Clean up preview URLs
      if (stagedVideoUrl) {
        URL.revokeObjectURL(stagedVideoUrl);
      }
      for (const image of stagedImages) {
        if (image.isNew && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      }

      // Clear staged state
      setStagedVideoFile(null);
      setStagedVideoUrl(null);
      setStagedImages([]);
      setHasUnsavedMediaChanges(false);
      setImagesWereModified(false);

      toast.success('Media saved successfully!');

    } catch (error) {
      console.error('Error saving media:', error);
      toast.error('Failed to save media. Please try again.');
    } finally {
      setIsSavingMedia(false);
    }
  };

  // Discard staged media changes
  const handleDiscardMedia = () => {
    if (!hasUnsavedMediaChanges) return;

    if (!confirm('Are you sure you want to discard all unsaved media changes?')) {
      return;
    }

    // Clean up preview URLs
    if (stagedVideoUrl && stagedVideoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(stagedVideoUrl);
    }
    for (const image of stagedImages) {
      if (image.isNew && image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
    }

    // Reset staged state
    setStagedVideoFile(null);
    setStagedVideoUrl(null);
    setStagedImages([]);
    setHasUnsavedMediaChanges(false);
    setImagesWereModified(false);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('Users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        const profileData = {
          ...data,
          degrees: data.degree ? JSON.parse(data.degree) : [],
          languages: data.languages ? JSON.parse(data.languages) : [],
          specialty: (() => {
            if (!data.specialty) return [];
            if (Array.isArray(data.specialty)) return data.specialty.filter(Boolean);
            if (typeof data.specialty === 'string') {
              try {
                const parsed = JSON.parse(data.specialty);
                if (Array.isArray(parsed)) {
                  return parsed.filter(Boolean);
                }
                return data.specialty.trim() ? [data.specialty.trim()] : [];
              } catch {
                return data.specialty.trim() ? [data.specialty.trim()] : [];
              }
            }
            return [data.specialty];
          })(),
          rate: data.rate || 0,
          gender: data.gender || '',
          user_type: data.user_type || 'patient',
          date_of_birth: data.date_of_birth || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          medical_conditions: data.medical_conditions ? (Array.isArray(data.medical_conditions) ? data.medical_conditions : JSON.parse(data.medical_conditions || '[]')) : [],
          insurance_provider: data.insurance_provider || '',
          years_of_experience: data.experience || 0,
          specialty_rate: (() => {
            if (!data.specialty_rate) return {};
            try {
              return JSON.parse(data.specialty_rate);
            } catch {
              return {};
            }
          })(),
          // Media fields
          video: data.video || null,
          images: data.images || null
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
        setAddressInput(profileData.address || '');
        
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (field: string, value: string | number | string[]) => {
    if (!profile) return;

    setProfile(prev => ({
      ...prev!,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePhoneChange = (value: string) => {
    handleInputChange('phone', value);
  };

  const onLoadAutocomplete = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setAddressInput(place.formatted_address);
        handleInputChange('address', place.formatted_address);
      }
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!profile?.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!profile?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (profile?.rate && profile.rate < 0) {
      newErrors.rate = 'Rate cannot be negative';
    }

    if (profile?.website && !profile.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, avatar: 'Please select a valid image file.' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'Image size must be less than 5MB.' }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.avatar;
      return newErrors;
    });

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPendingAvatarFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  const deleteOldAvatar = async (avatarUrl: string): Promise<void> => {
    if (!avatarUrl) return;

    try {
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      const { error: deleteError } = await supabase.storage
        .from('kaizen')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting old avatar:', deleteError);
      }
    } catch (error) {
      console.error('Error processing avatar deletion:', error);
    }
  };

  const uploadAvatarToStorage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      if (profile?.avatar) {
        await deleteOldAvatar(profile.avatar);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('kaizen')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Failed to upload image');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('kaizen')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!profile || !validateForm()) return;

    setIsSaving(true);
    setErrors({});

    try {
      let avatarUrl = profile.avatar;

      if (pendingAvatarFile) {
        try {
          avatarUrl = await uploadAvatarToStorage(pendingAvatarFile);
          if (!avatarUrl) {
            setErrors({ avatar: 'Failed to upload image. Please try again.' });
            return;
          }
        } catch {
          setErrors({ avatar: 'Failed to upload image. Please try again.' });
          return;
        }
      }

      const profileUpdate = {
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        avatar: avatarUrl,
        gender: profile.gender,
        languages: profile.languages,
        ...(profile.user_type === 'practitioner' && {
          degrees: Array.isArray(profile.degrees) ? profile.degrees.filter(d => d.trim()) : [],
          title: profile.title,
          specialty: JSON.stringify(Array.isArray(profile.specialty) ? profile.specialty.filter(Boolean).filter((spec, index, arr) => arr.indexOf(spec) === index) : []),
          clinic: profile.clinic,
          website: profile.website,
          rate: profile.rate || null,
          experience: profile.years_of_experience?.toString() || null,
        }),
        // ...(profile.user_type === 'patient' && {
        //   date_of_birth: profile.date_of_birth || null,
        //   emergency_contact_name: profile.emergency_contact_name || null,
        //   emergency_contact_phone: profile.emergency_contact_phone || null,
        //   medical_conditions: profile.medical_conditions || [],
        //   insurance_provider: profile.insurance_provider || null,
        // })
      };

      const result = await updateProfile(profileUpdate);

      if (!result.success) {
        setErrors({ general: result.error || 'Failed to update profile' });
        return;
      }

      if (avatarUrl !== profile.avatar) {
        setProfile(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      }

      setPendingAvatarFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});

    if (originalProfile) {
      setProfile({ ...originalProfile });
      setAddressInput(originalProfile.address || '');
    }

    setPendingAvatarFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };


  const hasChanges = () => {
    if (!profile || !originalProfile) return false;

    if (pendingAvatarFile) return true;

    const fieldsToCompare = [
      'full_name', 'phone', 'address', 'title',
      'clinic', 'website', 'rate', 'gender', 'years_of_experience',
      'date_of_birth', 'emergency_contact_name', 'emergency_contact_phone', 'insurance_provider'
    ];

    for (const field of fieldsToCompare) {
      if (profile[field as keyof ProfileData] !== originalProfile[field as keyof ProfileData]) {
        return true;
      }
    }

    if (JSON.stringify(profile.degrees) !== JSON.stringify(originalProfile.degrees)) {
      return true;
    }

    if (JSON.stringify(profile.languages) !== JSON.stringify(originalProfile.languages)) {
      return true;
    }

    if (JSON.stringify(profile.specialty) !== JSON.stringify(originalProfile.specialty)) {
      return true;
    }

    if (JSON.stringify(profile.medical_conditions) !== JSON.stringify(originalProfile.medical_conditions)) {
      return true;
    }

    return false;
  };

  // Delete video (staged or saved)
  const handleDeleteVideo = () => {
    // Clean up staged video if exists
    if (stagedVideoUrl && stagedVideoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(stagedVideoUrl);
    }

    // Reset staged video state and mark for deletion
    setStagedVideoFile(null);
    setStagedVideoUrl('DELETED'); // Use special marker to indicate deletion

    setHasUnsavedMediaChanges(true);
  };

  // Delete image (staged or saved)
  const handleDeleteImage = (index: number) => {
    // If we're working with saved images, stage them first
    if (stagedImages.length === 0 && profile?.images) {
      const savedImages = JSON.parse(profile.images).map((url: string) => ({
        url: url,
        file: undefined,
        isNew: false
      }));
      setStagedImages(savedImages);
    }

    // Get current images
    const currentImages = stagedImages.length > 0
      ? stagedImages
      : (profile?.images ? JSON.parse(profile.images).map((url: string) => ({ url, file: undefined, isNew: false })) : []);

    const imageToDelete = currentImages[index];

    // Clean up blob URL if it's a new image
    if (imageToDelete && imageToDelete.isNew && imageToDelete.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToDelete.url);
    }

    // Remove the image
    setStagedImages(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedMediaChanges(true);
    setImagesWereModified(true);
  };

  const getCurrentAvatarUrl = () => {
    return previewUrl || profile?.avatar || 'https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg';
  };

  // Don't render until client-side hydration is complete
  if (!isClient || authLoading || loading || specialtiesLoading) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) {
    return (
      <div className="mt-30 font-sans min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  const currentAvatarUrl = getCurrentAvatarUrl();

  return (
    <div className="mt-30 font-sans min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Tabbed Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="flex flex-wrap border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 md:px-8 py-4 font-medium transition-colors whitespace-nowrap ${activeTab === tab
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-8">
            {activeTab === 'Profile' && (
              <div className="space-y-6">
                {/* Avatar Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-[#012047]">Profile Avatar</h2>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      {!isEditing ? (
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setAddressInput(profile?.address || '');
                          }}
                          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors text-center w-full sm:w-auto"
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleCancel}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors text-center w-full sm:w-auto"
                            disabled={isSaving}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={isSaving || isUpdating || !hasChanges()}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors text-center w-full sm:w-auto"
                          >
                            {isSaving || isUpdating ? 'Saving...' : 'Save Changes'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Image
                        src={currentAvatarUrl}
                        alt={previewUrl ? "Profile Avatar Preview" : "Profile Avatar"}
                        width={300}
                        height={300}
                        className={`w-24 h-24 rounded-full object-cover border-4 ${previewUrl ? 'border-green-300' : 'border-gray-200'
                          }`}
                      />

                      {isEditing && (
                        <label className="absolute inset-0 w-24 h-24 rounded-full cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarSelect}
                            className="hidden"
                            disabled={isSaving}
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-[#012047] mb-1">
                        Profile Picture
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {isEditing
                          ? "Click on your avatar to select a new photo. It will be uploaded when you save changes."
                          : "Your profile picture will be displayed in the header and throughout the application."
                        }
                      </p>
                      {isEditing && (
                        <p className="text-xs text-gray-500">
                          Supported formats: JPG, PNG, GIF. Max size: 5MB
                        </p>
                      )}
                      {errors.avatar && (
                        <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h2 className="text-xl font-semibold text-[#012047] mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#012047] mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${isEditing ? 'bg-white' : 'bg-gray-100'
                          } ${errors.full_name ? 'border-red-300' : 'border-gray-300'}`}
                      />
                      {errors.full_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#012047] mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled={true}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#012047] mb-2">
                        Phone Number
                      </label>
                      <PhoneInput
                        country={'us'}
                        value={profile.phone || ''}
                        onChange={handlePhoneChange}
                        disabled={!isEditing}
                        inputProps={{
                          name: 'phone',
                          autoFocus: false,
                          disabled: !isEditing,
                          readOnly: !isEditing
                        }}
                        containerClass="w-full"
                        inputClass={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent border-gray-300 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                          }`}
                        buttonClass={`px-3 py-3 border rounded-l-lg border-gray-300 ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        dropdownClass="text-sm shadow-lg border border-gray-200 rounded-lg"
                        inputStyle={{
                          width: '100%',
                          height: '48px',
                          paddingLeft: '60px',
                          fontSize: '16px',
                          backgroundColor: !isEditing ? '#f3f4f6' : 'white',
                          cursor: !isEditing ? 'not-allowed' : 'text'
                        }}
                        buttonStyle={{
                          height: '48px',
                          borderRight: 'none',
                          backgroundColor: !isEditing ? '#f3f4f6' : '#f9fafb',
                          cursor: !isEditing ? 'not-allowed' : 'pointer'
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#012047] mb-2">
                        Gender
                      </label>
                      <Select
                        value={profile.gender ? { value: profile.gender, label: profile.gender } : null}
                        onChange={(option) => handleInputChange('gender', option?.value || '')}
                        options={[
                          { value: 'Male', label: 'Male' },
                          { value: 'Female', label: 'Female' },
                        ]}
                        styles={customSelectStyles}
                        placeholder="Select gender"
                        isClearable
                        isDisabled={!isEditing}
                        isSearchable={false}
                      />
                    </div>

                    {profile.user_type === 'practitioner' && (
                      <div>
                        <label className="block text-sm font-medium text-[#012047] mb-2">
                          Degree & Certification
                        </label>
                        <Select
                          value={profile.degrees[0] ? { value: profile.degrees[0], label: profile.degrees[0] } : null}
                          onChange={(option) => handleInputChange('degrees', option ? [option.value] : [])}
                          options={availableDegrees.map(degree => ({ value: degree, label: degree }))}
                          styles={customSelectStyles}
                          placeholder="Select degree"
                          isClearable
                          isDisabled={!isEditing}
                          isSearchable
                        />
                      </div>
                    )}
                  </div>
                </div>

                {profile.user_type === 'practitioner' && (
                  <div>
                    <h2 className="text-xl font-semibold text-[#012047] mb-4">Professional Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div>
                        <label className="block text-sm font-medium text-[#012047] mb-2">
                          Clinic/Hospital
                        </label>
                        <input
                          type="text"
                          value={profile.clinic || ''}
                          onChange={(e) => handleInputChange('clinic', e.target.value)}
                          placeholder="Enter clinic/hospital name"
                          disabled={!isEditing}
                          className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                            !isEditing ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#012047] mb-2">
                          Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          value={profile.rate || ''}
                          onChange={(e) => handleInputChange('rate', parseFloat(e.target.value) || 0)}
                          disabled={!isEditing}
                          className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${isEditing ? 'bg-white' : 'bg-gray-100'
                            } ${errors.rate ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        {errors.rate && (
                          <p className="mt-1 text-sm text-red-600">{errors.rate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#012047] mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={profile.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          disabled={!isEditing}
                          placeholder="https://example.com"
                          className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${isEditing ? 'bg-white' : 'bg-gray-100'
                            } ${errors.website ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        {errors.website && (
                          <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#012047] mb-2">
                          Years of Experience
                        </label>
                        <Select
                          value={profile.years_of_experience ?
                            { value: profile.years_of_experience, label: `${profile.years_of_experience} ${profile.years_of_experience === 1 ? 'year' : 'years'} (since ${new Date().getFullYear() - profile.years_of_experience})` } : null}
                          onChange={(option) => handleInputChange('years_of_experience', option?.value || 0)}
                          options={Array.from({ length: new Date().getFullYear() - 1970 + 1 }, (_, i) => {
                            const year = 1970 + i;
                            const experience = new Date().getFullYear() - year;
                            return {
                              value: experience,
                              label: `${experience} ${experience === 1 ? 'year' : 'years'} (since ${year})`
                            };
                          }).reverse()}
                          styles={customSelectStyles}
                          placeholder="Select experience years"
                          isClearable
                          isDisabled={!isEditing}
                          isSearchable
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#012047] mb-2">
                          Practice Address
                        </label>
                        {isEditing ? (
                          <Autocomplete
                            onLoad={onLoadAutocomplete}
                            onPlaceChanged={onPlaceChanged}
                          >
                            <input
                              type="text"
                              value={addressInput}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setAddressInput(newValue);
                                handleInputChange('address', newValue);
                              }}
                              placeholder="Enter your practice address"
                              className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white border-gray-300"
                            />
                          </Autocomplete>
                        ) : (
                          <input
                            type="text"
                            value={profile.address || ''}
                            disabled={true}
                            className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100 border-gray-300"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative">
                      <label className="block text-sm font-medium text-[#012047] mb-2">
                        Languages Spoken
                      </label>
                      {isEditing ? (
                        <div className="border rounded-lg p-1 bg-white">
                          <LanguageSelector
                            onSelect={handleLanguageSelect}
                            includeDetails={true}
                          />
                        </div>
                      ) : (
                        <div className="w-full px-3 py-3 border rounded-lg bg-gray-100 border-gray-300 text-gray-600">
                          Select languages...
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-[#012047] mb-2">
                        Selected Languages
                      </label>

                      <div className="min-h-[48px] flex items-start p-3">
                        {profile.languages.length > 0 ? (
                          <div className="flex flex-wrap gap-2 w-full">
                            {profile.languages.map((lang, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                              >
                                {lang}
                                {isEditing && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newLanguages = profile.languages.filter(l => l !== lang);
                                      handleInputChange('languages', newLanguages);
                                    }}
                                    className="ml-2 text-green-600 hover:text-green-800 text-lg leading-none"
                                  >
                                    ×
                                  </button>
                                )}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm italic">
                            No languages selected
                          </div>
                        )}
                      </div>
                    </div>

                    {profile?.user_type === 'practitioner' && (
                      <>
                        <div className="relative">
                          <h3 className="text-sm font-semibold text-[#012047] mb-2">Medical Specialties</h3>
                          <Select
                            closeMenuOnSelect={true}
                            components={animatedComponents}
                            value={null}
                            onChange={(selectedOption) => {
                              if (selectedOption && !profile.specialty.includes((selectedOption as { value: string, label: string }).value)) {
                                const newSpecialties = [...profile.specialty, (selectedOption as { value: string, label: string }).value];
                                handleInputChange('specialty', newSpecialties);
                              }
                            }}
                            options={specialties.map(specialty => ({ value: specialty.title, label: specialty.title })).filter(option => !profile.specialty.includes(option.value))}
                            styles={customSelectStyles}
                            placeholder="Select specialties..."
                            isDisabled={!isEditing || specialtiesLoading}
                            isSearchable
                            isLoading={specialtiesLoading}
                            noOptionsMessage={() => specialtiesError ? `Error loading specialties: ${specialtiesError}` : 'No specialties available'}
                          />
                          {specialtiesError && (
                            <p className="mt-1 text-sm text-red-600">
                              Error loading specialties: {specialtiesError}
                            </p>
                          )}
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-medium text-[#012047] mb-2">
                            Selected Specialties
                          </label>

                          <div className="min-h-[48px] flex items-start p-3">
                            {Array.isArray(profile.specialty) && profile.specialty.length > 0 ? (
                              <div className="flex flex-wrap gap-2 w-full">
                                {profile.specialty.map((spec, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                  >
                                    {spec}
                                    {isEditing && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newSpecialties = Array.isArray(profile.specialty) ? profile.specialty.filter((_, i) => i !== index) : [];
                                          handleInputChange('specialty', newSpecialties);
                                        }}
                                        className="ml-2 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:bg-blue-200 hover:text-blue-600 rounded-full"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm italic">
                                No specialties selected
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'Availability' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[#012047]">Availability Management</h2>
                      <p className="text-gray-600 mt-1">Manage your availability and view patient bookings. You can block/unblock available time slots.</p>
                    </div>
                    <button
                      onClick={handleAvailabilitySave}
                      disabled={isSavingAvailability || loadingDateAvailability}
                      className="bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg"
                    >
                      {isSavingAvailability ? 'Saving...' : 'Save'}
                    </button>
                  </div>

                  {/* Calendar and Time Slots Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Calendar - Left Side */}
                    <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-6">
                      {/* Month Navigation Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => navigateMonth('prev')}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        <h3 className="text-lg font-medium text-gray-900">{getMonthYearString()}</h3>
                        
                        <button
                          onClick={() => navigateMonth('next')}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Full Calendar */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
                          <div>Sun</div>
                          <div>Mon</div>
                          <div>Tue</div>
                          <div>Wed</div>
                          <div>Thu</div>
                          <div>Fri</div>
                          <div>Sat</div>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1">
                          {generateCalendarDates().map((date, index) => {
                            const isPastDate = isDatePast(date);
                            const isCurrentMonth = isDateInCurrentMonth(date);
                            
                            return (
                              <button
                                key={index}
                                onClick={() => !isPastDate && setSelectedDate(date)}
                                disabled={isPastDate}
                                className={`
                                  p-2 text-sm rounded-lg transition-all relative
                                  ${!isCurrentMonth ? 'text-gray-300' : ''}
                                  ${isPastDate 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'hover:bg-gray-100'
                                  }
                                  ${isDateSelected(date) 
                                    ? 'bg-blue-500 text-white font-semibold' 
                                    : ''
                                  }
                                  ${isDateToday(date) && !isDateSelected(date)
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : !isDateSelected(date) ? 'text-gray-700' : ''
                                  }
                                `}
                              >
                                {date.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected Date Display */}
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">Selected Date</h4>
                        <p className="text-blue-700">{formatDate(selectedDate)}</p>
                        <div className="mt-2 text-sm text-blue-600">
                          {loadingDateAvailability ? (
                            'Loading availability...'
                          ) : (
                            `Available slots: ${Object.values(getCurrentDateAvailability()).filter(Boolean).length} / ${defaultTimeSlots.length}`
                          )}
                        </div>

                        {/* Enhanced Booking Details for Selected Date */}
                        {(() => {
                          const dateStr = formatDateForAPI(selectedDate);
                          const dayBookings = bookingDetails[dateStr] || [];

                          if (dayBookings.length > 0) {
                            return (
                              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-blue-200">
                                <div className="flex items-center mb-3 sm:mb-4">
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h.01M3 7h18l-1 10a2 2 0 01-2 2H6a2 2 0 01-2-2L3 7z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <h5 className="font-medium sm:font-semibold text-sm sm:text-base text-gray-900">Today&apos;s Appointments</h5>
                                    <p className="text-xs text-gray-600">{dayBookings.filter(booking => booking.service_type !== 'blocked').length} booking{dayBookings.filter(booking => booking.service_type !== 'blocked').length !== 1 ? 's' : ''} scheduled</p>
                                  </div>
                                </div>
                                <div className="space-y-2 sm:space-y-3 max-h-40 sm:max-h-48 overflow-y-auto custom-scrollbar">
                                  {dayBookings.filter((booking: any) => booking.service_type !== 'blocked').map((booking: any, index: number) => {
                                    const timeDisplay = (() => {
                                      const hour = parseInt(booking.time.split(':')[0]);
                                      const nextHour = hour + 1;
                                      let startTime, endTime;

                                      if (hour < 12) {
                                        startTime = hour === 0 ? '12:00 AM' : `${hour}:00 AM`;
                                        endTime = nextHour === 12 ? '12:00 PM' : `${nextHour}:00 AM`;
                                      } else {
                                        startTime = hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
                                        endTime = `${nextHour === 24 ? 12 : nextHour - 12}:00 PM`;
                                      }

                                      return `${startTime} - ${endTime}`;
                                    })();

                                    return (
                                      <div
                                        key={index}
                                        className="bg-gradient-to-r from-white to-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-orange-300 cursor-pointer active:scale-98 touch-manipulation"
                                        onClick={() => handleBookedSlotClick(booking.time)}
                                      >
                                        {/* Mobile Layout */}
                                        <div className="block sm:hidden">
                                          <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-start space-x-2">
                                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-blue-200">
                                                <Image
                                                  src={getPatientAvatarUrl(booking)}
                                                  alt={`${booking.patient?.full_name || 'Patient'} avatar`}
                                                  width={32}
                                                  height={32}
                                                  className="w-full h-full object-cover"
                                                  onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg';
                                                  }}
                                                />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <h6 className="font-semibold text-gray-900 text-sm truncate">{booking.patient?.full_name || 'Unknown Patient'}</h6>
                                                <p className="text-xs text-gray-600">{booking.service_type}</p>
                                              </div>
                                            </div>
                                            <div className="text-right ml-2">
                                              <div className="text-base font-bold text-green-600">${booking.price}</div>
                                            </div>
                                          </div>

                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center text-blue-600 font-medium text-sm">
                                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                              {timeDisplay}
                                            </div>
                                            <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                              booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                              'bg-gray-100 text-gray-800'
                                            }`}>
                                              {booking.status}
                                            </div>
                                          </div>

                                          {booking.reason && (
                                            <div className="mb-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                              <div className="flex items-start">
                                                <svg className="w-3 h-3 text-yellow-600 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="text-xs text-yellow-800 leading-relaxed line-clamp-1">
                                                  {booking.reason.length > 50 ? `${booking.reason.substring(0, 50)}...` : booking.reason}
                                                </p>
                                              </div>
                                            </div>
                                          )}

                                          <div className="text-center">
                                            <div className="text-xs text-gray-500 bg-gray-100 py-1 px-2 rounded">
                                              {booking.reason && booking.reason.length > 50 ? 'Tap for full details' : 'Tap to view details'}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Desktop Layout */}
                                        <div className="hidden sm:block">
                                          <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3 flex-1">
                                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-blue-200">
                                                <Image
                                                  src={getPatientAvatarUrl(booking)}
                                                  alt={`${booking.patient?.full_name || 'Patient'} avatar`}
                                                  width={40}
                                                  height={40}
                                                  className="w-full h-full object-cover"
                                                  onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg';
                                                  }}
                                                />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                  <div>
                                                    <h6 className="font-semibold text-gray-900 text-sm truncate">{booking.patient?.full_name || 'Unknown Patient'}</h6>
                                                    <p className="text-xs text-gray-600 mt-0.5">{booking.service_type}</p>
                                                  </div>
                                                  <div className="text-right ml-2 flex-shrink-0">
                                                    <div className="text-lg font-bold text-green-600">${booking.price}</div>
                                                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                      'bg-gray-100 text-gray-800'
                                                    }`}>
                                                      {booking.status}
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between">
                                                  <div className="flex items-center text-blue-600 font-medium text-sm">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {timeDisplay}
                                                  </div>
                                                  <div className="text-xs text-gray-500">
                                                    {booking.reason && booking.reason.length > 80 ? 'Click for full details →' : 'Click to view details →'}
                                                  </div>
                                                </div>

                                                {booking.reason && (
                                                  <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                                    <div className="flex items-start">
                                                      <svg className="w-3 h-3 text-yellow-600 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                      </svg>
                                                      <p className="text-xs text-yellow-800 leading-relaxed line-clamp-2">
                                                        {booking.reason.length > 80 ? `${booking.reason.substring(0, 80)}...` : booking.reason}
                                                      </p>
                                                    </div>
                                                  </div>
                                                )}

                                                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                                  <div className="flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    {booking.patient?.email || 'N/A'}
                                                  </div>
                                                  <div className="flex items-center">
                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {booking.patient?.phone || 'N/A'}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }

                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Time Slots - Right Side */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Time Slots for {formatDate(selectedDate)}
                      </h3>
                      
                      {loadingDateAvailability ? (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-gray-500">Loading availability...</div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Morning Slots */}
                          <div>
                            <h4 className="text-md font-medium text-gray-700 mb-3">Morning (8:00 AM - 12:00 PM)</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {defaultTimeSlots.slice(0, 4).map((timeSlot) => {
                                const hour = parseInt(timeSlot.split(':')[0]);
                                const nextHour = hour + 1;
                                const startTime = `${hour}:00 AM`;
                                const endTime = nextHour === 12 ? '12:00 PM' : `${nextHour}:00 AM`;
                                const displayTime = `${startTime} - ${endTime}`;
                                const currentAvailability = getCurrentDateAvailability();
                                const isAvailable = currentAvailability[timeSlot] !== false;

                                const dateStr = formatDateForAPI(selectedDate);
                                const dayBookings = bookingDetails[dateStr] || [];

                                // Check booking status
                                const slotBooking = dayBookings.find(booking => booking.time === timeSlot);
                                const isPatientBooking = slotBooking && slotBooking.service_type !== 'blocked';

                                // Determine visual state
                                let buttonClass = '';
                                let statusText = '';
                                let isClickable = true;

                                if (isPatientBooking) {
                                  // Patient booking - orange, not clickable
                                  buttonClass = 'bg-orange-500 border-orange-500 text-white';
                                  statusText = 'Booked';
                                  isClickable = false;
                                } else if (isAvailable) {
                                  // Available (green) - either naturally available or toggled from blocked
                                  buttonClass = 'bg-green-500 border-green-500 text-white hover:bg-green-600 cursor-pointer';
                                  statusText = 'Available';
                                } else {
                                  // Unavailable (gray) - either blocked in DB or manually set unavailable
                                  buttonClass = 'bg-gray-400 border-gray-400 text-white hover:bg-gray-500 cursor-pointer';
                                  statusText = 'Blocked';
                                }

                                return (
                                  <button
                                    key={`morning-${timeSlot}`}
                                    onClick={() => isPatientBooking ? handleBookedSlotClick(timeSlot) : toggleDateAvailability(timeSlot)}
                                    disabled={!isClickable && !isPatientBooking}
                                    className={`
                                      p-3 rounded-lg border-2 text-sm font-medium transition-all
                                      ${buttonClass}
                                      ${isPatientBooking ? 'hover:bg-orange-600' : ''}
                                      ${!isClickable && !isPatientBooking ? 'cursor-not-allowed opacity-50' : ''}
                                    `}
                                  >
                                    <div>{displayTime}</div>
                                    <div className="text-xs mt-1">
                                      {statusText}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Afternoon Slots */}
                          <div>
                            <h4 className="text-md font-medium text-gray-700 mb-3">Afternoon (2:00 PM - 6:00 PM)</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {defaultTimeSlots.slice(4, 8).map((timeSlot) => {
                                const hour = parseInt(timeSlot.split(':')[0]);
                                const nextHour = hour + 1;
                                const displayTime = `${hour - 12}:00 PM - ${nextHour - 12}:00 PM`;
                                const currentAvailability = getCurrentDateAvailability();
                                const isAvailable = currentAvailability[timeSlot] !== false;

                                const dateStr = formatDateForAPI(selectedDate);
                                const dayBookings = bookingDetails[dateStr] || [];

                                // Check booking status
                                const slotBooking = dayBookings.find(booking => booking.time === timeSlot);
                                const isPatientBooking = slotBooking && slotBooking.service_type !== 'blocked';

                                // Determine visual state
                                let buttonClass = '';
                                let statusText = '';
                                let isClickable = true;

                                if (isPatientBooking) {
                                  // Patient booking - orange, not clickable
                                  buttonClass = 'bg-orange-500 border-orange-500 text-white';
                                  statusText = 'Booked';
                                  isClickable = false;
                                } else if (isAvailable) {
                                  // Available (green) - either naturally available or toggled from blocked
                                  buttonClass = 'bg-green-500 border-green-500 text-white hover:bg-green-600 cursor-pointer';
                                  statusText = 'Available';
                                } else {
                                  // Unavailable (gray) - either blocked in DB or manually set unavailable
                                  buttonClass = 'bg-gray-400 border-gray-400 text-white hover:bg-gray-500 cursor-pointer';
                                  statusText = 'Blocked';
                                }

                                return (
                                  <button
                                    key={`afternoon-${timeSlot}`}
                                    onClick={() => isPatientBooking ? handleBookedSlotClick(timeSlot) : toggleDateAvailability(timeSlot)}
                                    disabled={!isClickable && !isPatientBooking}
                                    className={`
                                      p-3 rounded-lg border-2 text-sm font-medium transition-all
                                      ${buttonClass}
                                      ${isPatientBooking ? 'hover:bg-orange-600' : ''}
                                      ${!isClickable && !isPatientBooking ? 'cursor-not-allowed opacity-50' : ''}
                                    `}
                                  >
                                    <div>{displayTime}</div>
                                    <div className="text-xs mt-1">
                                      {statusText}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status Legend */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm">
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded bg-green-500"></div>
                              <span className="text-gray-600">Available</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded bg-orange-500"></div>
                              <span className="text-gray-600">Booked</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded bg-gray-400"></div>
                              <span className="text-gray-600">Manually Blocked</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Services' && profile.user_type === 'practitioner' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[#012047]">Service Rates</h2>
                      <p className="text-gray-600 mt-1">Set hourly rates for your different specialties</p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      {!isEditingServices ? (
                        <button
                          onClick={() => {
                            setIsEditingServices(true);
                            // Initialize service rates from profile specialties
                            const rates: {[key: string]: number} = {};
                            (Array.isArray(profile.specialty) ? profile.specialty : []).forEach(spec => {
                              rates[spec] = profile.specialty_rate?.[spec] || serviceRates[spec] || profile.rate || 0;
                            });
                            setServiceRates(rates);
                          }}
                          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors text-center w-full sm:w-auto"
                        >
                          Edit Rates
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsEditingServices(false);
                              setServiceRates({});
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors text-center w-full sm:w-auto"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              setIsSavingServices(true);
                              try {
                                const result = await updateProfile({
                                  specialty_rate: serviceRates
                                });

                                if (result.success) {
                                  setProfile(prev => prev ? { ...prev, specialty_rate: serviceRates } : null);
                                  setIsEditingServices(false);
                                  setServiceRates({});
                                } else {
                                  setErrors({ general: result.error || 'Failed to save specialty rates' });
                                }
                              } catch (error) {
                                console.error('Error saving specialty rates:', error);
                                setErrors({ general: 'Failed to save specialty rates' });
                              } finally {
                                setIsSavingServices(false);
                              }
                            }}
                            disabled={isSavingServices}
                            className="bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors text-center w-full sm:w-auto"
                          >
                            {isSavingServices ? 'Saving...' : 'Save Rates'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array.isArray(profile.specialty) && profile.specialty.length > 0 ? (
                        profile.specialty.map((specialty, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                <h3 className="font-semibold text-[#012047]">{specialty}</h3>
                              </div>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Specialty
                              </span>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Hourly Rate (USD)
                                </label>
                                {isEditingServices ? (
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                      type="number"
                                      min="0"
                                      step="1"
                                      value={serviceRates[specialty] || profile.specialty_rate?.[specialty] || profile.rate || ''}
                                      onChange={(e) => {
                                        const value = parseInt(e.target.value) || 0;
                                        setServiceRates(prev => ({
                                          ...prev,
                                          [specialty]: value
                                        }));
                                      }}
                                      placeholder={profile.rate ? `${profile.rate} (from profile)` : "0"}
                                      className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                  </div>
                                ) : (
                                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                                    <span className="text-2xl font-bold text-green-600">
                                      ${serviceRates[specialty] || profile.specialty_rate?.[specialty] || profile.rate || 0}
                                    </span>
                                    <span className="text-gray-500 ml-1">/hour</span>
                                    {!serviceRates[specialty] && !profile.specialty_rate?.[specialty] && profile.rate && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Using default rate from profile
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="text-sm text-gray-600">
                                <div className="flex items-center justify-between">
                                  <span>Session Duration:</span>
                                  <span className="font-medium">60 minutes</span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <span>Rate Type:</span>
                                  <span className="font-medium">Per Hour</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 text-center py-8">
                          <div className="text-gray-400 mb-4">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Specialties Added</h3>
                          <p className="text-gray-600 mb-4">Please add your medical specialties in the Profile tab first to set rates.</p>
                          <button
                            onClick={() => handleTabChange('Profile')}
                            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Add Specialties
                          </button>
                        </div>
                      )}
                    </div>

                    {profile.specialty.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-start">
                            <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <h4 className="font-medium text-blue-900 mb-1">Rate Information</h4>
                              <p className="text-sm text-blue-800">
                                • Rates are charged per hour for consultation services<br/>
                                • If no specialty-specific rate is set, your default Profile rate (${profile.rate || 0}) will be used<br/>
                                • Patients will see these rates when booking appointments<br/>
                                • You can adjust rates anytime based on demand and experience<br/>
                                • Different specialties can have different rates based on complexity
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Reviews' && profile.user_type === 'practitioner' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[#012047]">Google Reviews</h2>
                      <p className="text-gray-600 mt-1">Add your Google Business reviews to showcase your expertise</p>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      {!isEditingReviews ? (
                        <button
                          onClick={() => {
                            setIsEditingReviews(true);
                            setReviewsInput(profile.reviews || '');
                          }}
                          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors text-center w-full sm:w-auto"
                        >
                          {profile.reviews ? 'Edit Reviews' : 'Add Reviews'}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setIsEditingReviews(false);
                              setReviewsInput('');
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors text-center w-full sm:w-auto"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              // Validate Google Reviews URL
                              if (reviewsInput.trim()) {
                                const isValidUrl = /^https:\/\/(www\.)?google\.(com|co\.[a-z]{2}|[a-z]{2})\/(search|maps|review|place|business).*$/i.test(reviewsInput.trim());
                                if (!isValidUrl) {
                                  toast.error('Please enter a valid Google Reviews URL (must start with https://www.google.com/, https://google.com/, https://maps.google.com/, etc.)');
                                  setIsSavingReviews(false);
                                  return;
                                }
                              }

                              setIsSavingReviews(true);
                              try {
                                const result = await updateProfile({
                                  reviews: reviewsInput.trim()
                                });

                                if (result.success) {
                                  setProfile(prev => prev ? { ...prev, reviews: reviewsInput.trim() } : null);
                                  setIsEditingReviews(false);
                                  toast.success('Google Reviews link updated successfully!');
                                } else {
                                  toast.error(result.error || 'Failed to save reviews');
                                }
                              } catch (error) {
                                console.error('Error saving reviews:', error);
                                toast.error('Failed to save reviews');
                              } finally {
                                setIsSavingReviews(false);
                              }
                            }}
                            disabled={isSavingReviews}
                            className="bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors text-center w-full sm:w-auto"
                          >
                            {isSavingReviews ? 'Saving...' : 'Save Reviews'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditingReviews ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#012047] mb-2">
                          Google Reviews Link
                        </label>
                        <input
                          type="url"
                          value={reviewsInput}
                          onChange={(e) => setReviewsInput(e.target.value)}
                          placeholder="https://www.google.com/search?q=Your+Business+Name+Reviews or https://share.google/..."
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Enter your Google reviews URL (Google search results, share links, or business profile)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {profile.reviews ? (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-[#012047] mb-4">Your Google Reviews</h3>
                          <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-100 border border-gray-300 rounded-lg flex items-center justify-center p-8">
                            <div className="text-center max-w-md">
                              <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                              </div>
                              <h3 className="text-xl font-semibold text-gray-800 mb-3">Google Reviews</h3>
                              <p className="text-gray-600 text-sm mb-6">
                                Due to Google&apos;s security policies, reviews cannot be displayed directly here. Click below to view your reviews on Google.
                              </p>
                              <div className="flex items-center justify-center mb-6">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className="w-6 h-6 text-yellow-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                ))}
                              </div>
                              <a
                                href={profile.reviews}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                              >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View Reviews on Google
                              </a>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                              <strong>Reviews URL:</strong>
                              <a
                                href={profile.reviews}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline ml-1"
                              >
                                View Reviews on Google
                              </a>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <div className="max-w-sm mx-auto">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Added</h3>
                            <p className="text-gray-500 mb-4">
                              Add your Google Business reviews link to showcase your expertise and build trust with potential patients.
                            </p>
                            <button
                              onClick={() => {
                                setIsEditingReviews(true);
                                setReviewsInput('');
                              }}
                              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              Add Reviews
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Books' && profile.user_type === 'patient' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[#012047]">My Bookings</h2>
                      <p className="text-gray-600 mt-1">View and manage your appointment bookings with practitioners.</p>
                    </div>
                  </div>

                  {/* Calendar and Booking Details Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Calendar - Left Side */}
                    <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-6">
                      {/* Month Navigation Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => navigatePatientBookingMonth('prev')}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <h3 className="text-lg font-medium text-gray-900">{getPatientBookingMonthYearString()}</h3>

                        <button
                          onClick={() => navigatePatientBookingMonth('next')}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      {/* Full Calendar */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2">
                          <div>Sun</div>
                          <div>Mon</div>
                          <div>Tue</div>
                          <div>Wed</div>
                          <div>Thu</div>
                          <div>Fri</div>
                          <div>Sat</div>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {generatePatientBookingCalendarDates().map((date, index) => {
                            const isCurrentMonth = isDateInCurrentBookingMonth(date);
                            const dateStr = formatDateForAPI(date);
                            const hasBookings = patientBookings[dateStr] && patientBookings[dateStr].length > 0;

                            return (
                              <button
                                key={index}
                                onClick={() => setSelectedBookingDate(date)}
                                className={`
                                  p-2 text-sm rounded-lg transition-all relative
                                  ${isBookingDateSelected(date)
                                    ? 'bg-blue-500 text-white font-semibold'
                                    : hasBookings
                                    ? 'bg-green-100 border-2 border-green-400 text-green-700 font-bold hover:bg-green-200'
                                    : isDateToday(date)
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : !isCurrentMonth
                                    ? 'text-gray-300 hover:bg-gray-100'
                                    : 'text-gray-700 hover:bg-gray-100'
                                  }
                                `}
                              >
                                {date.getDate()}
                                {hasBookings && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected Date Display */}
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">Selected Date</h4>
                        <p className="text-blue-700">{formatDate(selectedBookingDate)}</p>
                        <div className="mt-2 text-sm text-blue-600">
                          {loadingPatientBookings ? (
                            'Loading bookings...'
                          ) : (
                            (() => {
                              const dateStr = formatDateForAPI(selectedBookingDate);
                              const dayBookings = patientBookings[dateStr] || [];
                              return `${dayBookings.length} booking${dayBookings.length !== 1 ? 's' : ''} scheduled`;
                            })()
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Booking Details - Right Side */}
                    <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Appointments for {formatDate(selectedBookingDate)}
                      </h4>

                      {loadingPatientBookings ? (
                        <div className="flex items-center justify-center h-40">
                          <div className="text-gray-500">Loading bookings...</div>
                        </div>
                      ) : (
                        (() => {
                          const dateStr = formatDateForAPI(selectedBookingDate);
                          const dayBookings = patientBookings[dateStr] || [];

                          if (dayBookings.length === 0) {
                            return (
                              <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h.01M3 7h18l-1 10a2 2 0 01-2 2H6a2 2 0 01-2-2L3 7z" />
                                </svg>
                                <h5 className="text-lg font-medium text-gray-500 mb-2">No Appointments</h5>
                                <p className="text-gray-400">You don&apos;t have any appointments scheduled for this date.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                              {dayBookings.filter((booking: any) => booking.service_type !== 'blocked').map((booking: any, index: number) => {
                                const timeDisplay = (() => {
                                  const hour = parseInt(booking.time.split(':')[0]);
                                  const nextHour = hour + 1;
                                  let startTime, endTime;

                                  if (hour < 12) {
                                    startTime = hour === 0 ? '12:00 AM' : `${hour}:00 AM`;
                                    endTime = nextHour === 12 ? '12:00 PM' : `${nextHour}:00 AM`;
                                  } else {
                                    startTime = hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
                                    endTime = `${nextHour === 24 ? 12 : nextHour - 12}:00 PM`;
                                  }

                                  return `${startTime} - ${endTime}`;
                                })();

                                return (
                                  <div
                                    key={index}
                                    className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-orange-300 cursor-pointer"
                                    onClick={() => handlePatientBookingClick(booking)}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start space-x-3 flex-1">
                                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-blue-200">
                                          <Image
                                            src={getPractitionerAvatarUrl(booking)}
                                            alt={`Dr. ${booking.practitioner?.full_name || 'Practitioner'} avatar`}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.src = 'https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg';
                                            }}
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h6 className="font-semibold text-gray-900 text-sm truncate">
                                            Dr. {booking.practitioner?.full_name || 'Unknown Practitioner'}
                                          </h6>
                                          <p className="text-xs text-gray-600">{booking.service_type}</p>
                                          <div className="flex items-center text-blue-600 font-medium text-sm mt-1">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {timeDisplay}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right ml-2">
                                        <div className="text-lg font-bold text-green-600">${booking.price}</div>
                                        <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {booking.status}
                                        </div>
                                      </div>
                                    </div>

                                    {booking.reason && (
                                      <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <div className="flex items-start">
                                          <svg className="w-3 h-3 text-yellow-600 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                          <p className="text-xs text-yellow-800 leading-relaxed">
                                            {booking.reason.length > 100 ? `${booking.reason.substring(0, 100)}...` : booking.reason}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Media' && profile.user_type === 'practitioner' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-[#012047]">Media Management</h2>
                      <p className="text-gray-600 mt-1">Upload and manage your video and images that will be displayed on your profile page.</p>
                    </div>
                  </div>

                  {/* Video Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Video (Max 1)</h3>
                    <p className="text-sm text-gray-600 mb-4">Upload a video to showcase your practice. Maximum file size: 50MB</p>

                    {mediaVideo ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <video
                            src={mediaVideo}
                            controls
                            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => handleDeleteVideo()}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 mb-4">Upload your profile video</p>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleVideoUpload(e.target.files?.[0])}
                          className="hidden"
                          id="video-upload"
                          disabled={uploadingVideo}
                        />
                        <label
                          htmlFor="video-upload"
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors cursor-pointer ${
                            uploadingVideo
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-primary hover:bg-primary/90'
                          }`}
                        >
                          {uploadingVideo ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                            </>
                          ) : (
                            'Choose Video File'
                          )}
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Save/Discard Buttons */}
                  {hasUnsavedMediaChanges && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-yellow-800 font-medium">You have unsaved media changes</p>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleDiscardMedia}
                            disabled={isSavingMedia}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Discard
                          </button>
                          <button
                            onClick={handleSaveMedia}
                            disabled={isSavingMedia}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                          >
                            {isSavingMedia ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              'Save Media'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Images Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Images</h3>
                    <p className="text-sm text-gray-600 mb-4">Upload multiple images to showcase your practice.</p>

                    {mediaImages.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-3">Your uploaded images:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {mediaImages.map((imageUrl, index) => (
                            <div
                              key={`${imageUrl}-${index}`}
                              className="relative group"
                            >
                              <Image
                                src={imageUrl}
                                alt={`Profile image ${index + 1}`}
                                width={300}
                                height={300}
                                className="w-full h-48 object-cover rounded-lg border border-gray-200 transition-transform hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <button
                                  onClick={() => handleDeleteImage(index)}
                                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                              <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600 mb-4">Upload images for your profile</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImagesUpload(Array.from(e.target.files || []))}
                        className="hidden"
                        id="images-upload"
                        disabled={uploadingImages}
                      />
                      <label
                        htmlFor="images-upload"
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors cursor-pointer ${
                          uploadingImages
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90'
                        }`}
                      >
                        {uploadingImages ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </>
                        ) : (
                          'Choose Image Files'
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Booking Details Modal */}
      {showBookingModal && selectedBookingInfo && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-xl shadow-2xl p-6 sm:p-8 w-full sm:max-w-lg sm:max-h-[90vh] overflow-y-auto transform animate-scaleIn border border-gray-100">
            {/* Mobile Handle Bar */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden"></div>

            {/* Header */}
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h.01M3 7h18l-1 10a2 2 0 01-2 2H6a2 2 0 01-2-2L3 7zm5 4v4m4-4v4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Booking Details</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Patient appointment information</p>
                </div>
              </div>
              <button
                onClick={closeBookingModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Patient Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-blue-100">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-blue-200">
                  <Image
                    src={getPatientAvatarUrl(selectedBookingInfo)}
                    alt={`${selectedBookingInfo.patient?.full_name || 'Patient'} avatar`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                    {selectedBookingInfo.patient?.full_name || 'Unknown Patient'}
                  </h4>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{selectedBookingInfo.patient?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{selectedBookingInfo.patient?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Date & Time */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h.01M3 7h18l-1 10a2 2 0 01-2 2H6a2 2 0 01-2-2L3 7z" />
                  </svg>
                  <h5 className="font-medium sm:font-semibold text-sm sm:text-base text-gray-800">Date & Time</h5>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">{new Date(selectedBookingInfo.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</p>
                <p className="text-base sm:text-lg font-semibold text-blue-600">{(() => {
                  const hour = parseInt(selectedBookingInfo.time.split(':')[0]);
                  const nextHour = hour + 1;
                  let startTime, endTime;

                  if (hour < 12) {
                    startTime = hour === 0 ? '12:00 AM' : `${hour}:00 AM`;
                    endTime = nextHour === 12 ? '12:00 PM' : `${nextHour}:00 AM`;
                  } else {
                    startTime = hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
                    endTime = `${nextHour === 24 ? 12 : nextHour - 12}:00 PM`;
                  }

                  return `${startTime} - ${endTime}`;
                })()}</p>
              </div>

              {/* Service & Price */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-green-300 transition-colors">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <h5 className="font-medium sm:font-semibold text-sm sm:text-base text-gray-800">Service & Price</h5>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{selectedBookingInfo.service_type}</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">${selectedBookingInfo.price}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-sm sm:text-base text-gray-700">Status:</span>
              </div>
              <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
                selectedBookingInfo.status === 'confirmed' ? 'bg-green-100 text-green-800 border border-green-200' :
                selectedBookingInfo.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {selectedBookingInfo.status?.charAt(0).toUpperCase() + selectedBookingInfo.status?.slice(1)}
              </span>
            </div>

            {/* Reason for Visit */}
            {selectedBookingInfo.reason && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-200">
                <div className="flex items-start">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium sm:font-semibold text-sm sm:text-base text-gray-800 mb-1">Reason for Visit</h5>
                    <p className="text-xs sm:text-sm text-gray-600">{selectedBookingInfo.reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Date */}
            <div className="mb-6 sm:mb-8">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Booking Date</label>
              <p className="text-sm sm:text-base text-gray-600">{new Date(selectedBookingInfo.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 sm:border-0 sm:pt-0">
              <button
                onClick={closeBookingModal}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-all duration-200 transform shadow-md hover:shadow-lg touch-manipulation w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Booking Details Modal */}
      {showBookingDetailsModal && selectedBookingDetails && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-xl shadow-2xl p-6 sm:p-8 w-full sm:max-w-lg sm:max-h-[90vh] overflow-y-auto transform animate-scaleIn border border-gray-100">
            {/* Mobile Handle Bar */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden"></div>

            {/* Header */}
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h.01M3 7h18l-1 10a2 2 0 01-2 2H6a2 2 0 01-2-2L3 7zm5 4v4m4-4v4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Appointment Details</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Your upcoming appointment information</p>
                </div>
              </div>
              <button
                onClick={closePatientBookingModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Practitioner Info Card */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-green-100">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-green-200">
                  <Image
                    src={getPractitionerAvatarUrl(selectedBookingDetails)}
                    alt={`Dr. ${selectedBookingDetails.practitioner?.full_name || 'Practitioner'} avatar`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                    Dr. {selectedBookingDetails.practitioner?.full_name || 'Unknown Practitioner'}
                  </h4>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{selectedBookingDetails.practitioner?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{selectedBookingDetails.practitioner?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h.01M3 7h18l-1 10a2 2 0 01-2 2H6a2 2 0 01-2-2L3 7z" />
                  </svg>
                  <h5 className="font-medium sm:font-semibold text-sm sm:text-base text-gray-800">Date & Time</h5>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">{new Date(selectedBookingDetails.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</p>
                <p className="text-base sm:text-lg font-semibold text-blue-600">{(() => {
                  const hour = parseInt(selectedBookingDetails.time.split(':')[0]);
                  const nextHour = hour + 1;
                  let startTime, endTime;

                  if (hour < 12) {
                    startTime = hour === 0 ? '12:00 AM' : `${hour}:00 AM`;
                    endTime = nextHour === 12 ? '12:00 PM' : `${nextHour}:00 AM`;
                  } else {
                    startTime = hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
                    endTime = `${nextHour === 24 ? 12 : nextHour - 12}:00 PM`;
                  }

                  return `${startTime} - ${endTime}`;
                })()}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <h5 className="font-medium sm:font-semibold text-sm sm:text-base text-gray-800">Service & Price</h5>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{selectedBookingDetails.service_type}</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">${selectedBookingDetails.price}</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-sm sm:text-base text-gray-700">Status:</span>
              </div>
              <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
                selectedBookingDetails.status === 'confirmed' ? 'bg-green-100 text-green-800 border border-green-200' :
                selectedBookingDetails.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {selectedBookingDetails.status?.charAt(0).toUpperCase() + selectedBookingDetails.status?.slice(1)}
              </span>
            </div>

            {/* Reason for Visit */}
            {selectedBookingDetails.reason && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-200">
                <div className="flex items-start">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium sm:font-semibold text-sm sm:text-base text-gray-800 mb-1">Reason for Visit</h5>
                    <p className="text-xs sm:text-sm text-gray-600">{selectedBookingDetails.reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 sm:border-0 sm:pt-0">
              <button
                onClick={closePatientBookingModal}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-all duration-200 transform shadow-md hover:shadow-lg touch-manipulation w-full sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;