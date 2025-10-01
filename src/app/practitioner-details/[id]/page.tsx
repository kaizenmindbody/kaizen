"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Book Appointment Button Component with Authentication Check
const BookAppointmentButton = ({ practitionerId, user, onServicesTab = false }: { practitionerId: string, user: any, onServicesTab?: boolean }) => {
  const router = useRouter();

  const handleBookAppointment = () => {
    // If we're already on the services tab, proceed with authentication check and booking
    if (onServicesTab) {
      // Check if user is authenticated
      if (!user) {
        // Store the intended booking URL in localStorage
        const bookingUrl = `/book/${practitionerId}?step=1`;
        localStorage.setItem('redirectAfterLogin', bookingUrl);

        // Redirect to login page
        router.push('/auth/signin');
        return;
      }

      // If user is a practitioner, don't allow booking (button should be disabled)
      if ((user as any).user_type === 'practitioner') {
        return; // Do nothing - button is disabled
      }

      // If user is authenticated patient, proceed to booking
      router.push(`/book/${practitionerId}?step=1`);
    } else {
      // If we're not on services tab, redirect to services tab first
      const servicesElement = document.querySelector('.navigation-tabs');
      if (servicesElement) {
        // Set the active tab to services
        const servicesTab = document.querySelector('[data-tab="Services, Pricing and Appointments"]');
        if (servicesTab) {
          (servicesTab as HTMLButtonElement).click();
        }
        // Scroll to the tabs section
        servicesElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Check if user is practitioner to disable button
  const isPractitioner = user && (user as any).user_type === 'practitioner';
  const isDisabled = isPractitioner;

  return (
    <button
      onClick={handleBookAppointment}
      disabled={isDisabled}
      className={`py-3 px-6 rounded-full font-medium transition-colors inline-block text-center ${
        isDisabled
          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
          : 'bg-secondary text-white hover:bg-green-600'
      }`}
    >
      {isPractitioner ? 'Cannot Book (Practitioner Account)' : 'Book Appointment'}
    </button>
  );
};

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import {
  MapPin,
  X,
  Globe,
  Award,
  Phone,
  Mail,
  Languages,
  Star,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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

// Comprehensive Skeleton Loading Component for Practitioner Details Page
const PractitionerDetailsSkeleton = () => {
  return (
    <div className="font-sans min-h-screen bg-gray-50 pt-[120px] animate-pulse">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-8 mb-6">
          <div className="grid lg:grid-cols-3 gap-8 min-h-[500px]">
            {/* Left Side - Video Skeleton */}
            <div className="lg:col-span-1 h-full">
              <div className="relative w-full h-full rounded-2xl bg-gray-200"></div>
            </div>

            {/* Middle Side - Info Skeleton */}
            <div className="lg:col-span-1 flex flex-col justify-between">
              <div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>

                <div className="space-y-4">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <div className="h-12 bg-gray-200 rounded-full w-48"></div>
              </div>
            </div>

            {/* Right Side - Map Skeleton */}
            <div className="lg:col-span-1">
              <div className="w-full h-[300px] lg:h-full bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Skeleton */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex-1 p-4">
                <div className="h-6 bg-gray-200 rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PractitionerDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [practitioner, setPractitioner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availabilities, setAvailabilities] = useState({});
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(false);
  const [loadingDates, setLoadingDates] = useState(new Set());
  const [activeTab, setActiveTab] = useState('About');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showAllMediaModal, setShowAllMediaModal] = useState(false);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [practitionerLocation, setPractitionerLocation] = useState(null);

  // Google Maps configuration
  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const defaultCenter = {
    lat: 49.2827, // Vancouver, BC coordinates
    lng: -123.1207
  };

  const practitionerId = params.id as string;

  // Check URL hash and set active tab on component mount
  useEffect(() => {
    const checkHashAndSetTab = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        console.log('Hash detected:', hash); // Debug log
        if (hash === '#services') {
          console.log('Setting active tab to Services'); // Debug log
          setActiveTab('Services, Pricing and Appointments');
          // Scroll to the tabs section after a short delay to ensure DOM is ready
          setTimeout(() => {
            const tabsElement = document.querySelector('.navigation-tabs');
            console.log('Tabs element found:', tabsElement); // Debug log
            if (tabsElement) {
              tabsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 1000); // Increased delay to ensure DOM is fully ready
        }
      }
    };

    // Check immediately
    checkHashAndSetTab();

    // Also check after a short delay in case hash isn't immediately available
    const timeoutId = setTimeout(checkHashAndSetTab, 100);

    // Listen for hash changes
    const handleHashChange = () => {
      checkHashAndSetTab();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChange);
    }

    return () => {
      clearTimeout(timeoutId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashchange', handleHashChange);
      }
    };
  }, []);

  // Additional check for hash when router is ready
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for hash in the current URL
      const hash = window.location.hash;
      console.log('Router ready, checking hash:', hash); // Debug log
      if (hash === '#services' && activeTab !== 'Services, Pricing and Appointments') {
        console.log('Router-based hash detection, setting tab to Services'); // Debug log
        setActiveTab('Services, Pricing and Appointments');
        // Scroll after a longer delay to ensure everything is loaded
        setTimeout(() => {
          const tabsElement = document.querySelector('.navigation-tabs');
          if (tabsElement) {
            tabsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 1500);
      }
    }
  }, [router, activeTab]);

  // Fetch specific practitioner data
  useEffect(() => {
    const fetchPractitioner = async () => {
      if (!practitionerId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/practitioners/${practitionerId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Practitioner not found');
          } else {
            setError('Failed to fetch practitioner');
          }
          return;
        }

        const result = await response.json();
        if (result.error) {
          setError(result.error);
          return;
        }

        const found = result.practitioner;
        if (!found) {
          setError('Practitioner not found');
          return;
        }

        // Transform the data for the detail page
        const transformedPractitioner = {
          ...found,
          avatar: {
            url: found.avatar || "https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg",
            alt: found.full_name || "Practitioner"
          },
          // Media fields
          video: found.video || null,
          images: (() => {
            if (!found.images) return [];
            try {
              const parsed = JSON.parse(found.images);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })(),
          degrees: Array.isArray(found.degrees) ? found.degrees.join(', ') : (found.degrees || ''),
          languages: Array.isArray(found.languages) ? found.languages : ['English'],
          clinic: found.clinic || 'Private Practice',
          address: found.address || 'Address not available',
          specialty: found.specialty || '',
          rate: found.rate,
          // Use actual reviews and rating from database
          reviews: found.reviews || 0,
          rating: found.rating || 0,
          experience: `${Math.floor(Math.random() * 20) + 5} Years`,
          successRate: `${Math.floor(Math.random() * 20) + 80}%`,
          totalPatients: Math.floor(Math.random() * 300) + 100,
          nextAvailable: `${Math.floor(Math.random() * 12) + 8}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'} - ${Math.floor(Math.random() * 28) + 1} ${['Jan', 'Feb', 'Mar', 'Apr', 'May'][Math.floor(Math.random() * 5)]}`,
          verified: Math.random() > 0.3,
          // Extended fields for detail page - use actual specialties from API
          specialties: (() => {
            if (!found.specialty) return ['General Practice'];

            // Handle if specialty is already an array
            if (Array.isArray(found.specialty)) {
              return found.specialty.filter(s => s && s.trim() !== '');
            }

            // Handle if specialty is a JSON string
            if (typeof found.specialty === 'string') {
              try {
                const parsed = JSON.parse(found.specialty);
                if (Array.isArray(parsed)) {
                  return parsed.filter(s => s && s.trim() !== '');
                }
              } catch {
                // If JSON parsing fails, treat as single specialty
                return [found.specialty.trim()];
              }

              // If it's just a regular string, return as single item array
              return [found.specialty.trim()];
            }

            return ['General Practice'];
          })(),
          services: [
            { name: 'Initial Consultation', duration: '60min', price: found.rate * 2 || 100 },
            { name: 'Follow-up Session', duration: '45min', price: found.rate || 50 },
            { name: 'Package Deal (3 sessions)', duration: '45min', price: (found.rate * 2.5) || 125 },
            { name: 'Specialized Treatment', duration: '30min', price: (found.rate * 1.5) || 75 }
          ],
          about: found.aboutme || (() => {
            // Extract real data from database
            const specialtyText = (() => {
              if (!found.specialty) return 'General Healthcare';
              if (typeof found.specialty === 'string') {
                try {
                  const parsed = JSON.parse(found.specialty);
                  return Array.isArray(parsed) ? parsed.join(', ') : found.specialty;
                } catch {
                  return found.specialty;
                }
              }
              return Array.isArray(found.specialty) ? found.specialty.join(', ') : 'General Healthcare';
            })();

            const degreesText = (() => {
              if (!found.degrees || (Array.isArray(found.degrees) && found.degrees.length === 0)) {
                return 'Licensed Healthcare Professional';
              }
              return Array.isArray(found.degrees) ? found.degrees.join(', ') : found.degrees;
            })();

            const experienceText = found.experience || 'Several years';
            const locationText = found.address || 'Available for consultations';
            const languagesText = (() => {
              if (!found.languages || (Array.isArray(found.languages) && found.languages.length === 0)) {
                return 'English';
              }
              return Array.isArray(found.languages) ? found.languages.join(', ') : found.languages;
            })();

            const rateText = found.rate ? `$${found.rate}` : 'Contact for pricing';

            return `<div class="space-y-6">
              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Professional Background</h4>
                <p class="text-gray-700 leading-relaxed">${found.full_name} is a dedicated healthcare professional with ${experienceText} of experience specializing in ${specialtyText}. Based in ${locationText}, ${found.full_name.split(' ')[0]} is committed to providing exceptional patient care and delivering outstanding therapeutic outcomes.</p>
              </div>

              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Education & Credentials</h4>
                <p class="text-gray-700 leading-relaxed"><strong>Qualifications:</strong> ${degreesText}</p>
                <p class="text-gray-700 leading-relaxed mt-2">Maintains active professional memberships and continuing education to stay current with the latest advancements in ${specialtyText.toLowerCase()} and evidence-based healthcare practices.</p>
              </div>

              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Specializations & Services</h4>
                <p class="text-gray-700 leading-relaxed"><strong>Areas of Expertise:</strong> ${specialtyText}</p>
                <p class="text-gray-700 leading-relaxed mt-2">Providing comprehensive care with personalized treatment plans tailored to each patient's unique needs and health goals.</p>
              </div>

              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Practice Information</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-gray-700"><strong>Location:</strong> ${locationText}</p>
                    <p class="text-gray-700 mt-1"><strong>Languages:</strong> ${languagesText}</p>
                  </div>
                  <div>
                    <p class="text-gray-700"><strong>Consultation Rate:</strong> ${rateText}/hour</p>
                    <p class="text-gray-700 mt-1"><strong>Experience:</strong> ${experienceText}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Treatment Approach</h4>
                <p class="text-gray-700 leading-relaxed">My practice focuses on evidence-based treatments combined with compassionate, patient-centered care. I believe in building strong therapeutic relationships through clear communication, collaborative treatment planning, and respect for each patient's individual journey toward optimal health.</p>
              </div>

              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Why Choose My Practice</h4>
                <p class="text-gray-700 leading-relaxed">With expertise in ${specialtyText.toLowerCase()}, I offer comprehensive healthcare services in a welcoming environment. My commitment to professional excellence, combined with ${experienceText} of hands-on experience, ensures that each patient receives the highest quality care tailored to their specific needs.</p>
              </div>
            </div>`;
          })(),
        };

        setPractitioner(transformedPractitioner);
      } catch {
        toast.error('Error fetching practitioner');
        setError('Failed to fetch practitioner');
      } finally {
        setLoading(false);
      }
    };

    fetchPractitioner();
  }, [practitionerId]);

  // Helper function to format date without timezone issues (matching profile page)
  const formatDateForAPI = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Fetch availability when selected date changes
  useEffect(() => {
    if (selectedDate && practitionerId) {
      fetchAvailabilityForDate(practitionerId, selectedDate);
    }
  }, [selectedDate, practitionerId]);

  // Fetch availability for all visible dates when calendar month changes
  useEffect(() => {
    if (selectedMonth && practitionerId && typeof generateCalendarDates === 'function') {
      const visibleDates = generateCalendarDates();
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

      // Only fetch for future dates and dates we don't already have data for
      visibleDates.forEach(date => {
        if (date && date >= today) {
          const dateStr = formatDateForAPI(date);
          if (!availabilities[dateStr]) {
            // Add a small delay to avoid overwhelming the API
            setTimeout(() => {
              fetchAvailabilityForDate(practitionerId, date);
            }, Math.random() * 200); // Random delay 0-200ms
          }
        }
      });
    }
  }, [selectedMonth, practitionerId, availabilities, formatDateForAPI]);

  // Fetch availability for a specific date (on-demand loading for better UX)
  const fetchAvailabilityForDate = useCallback(async (id: string, date: Date) => {
    const dateStr = formatDateForAPI(date);

    // Skip if already have data for this date or if currently loading this date
    if (availabilities[dateStr] || loadingDates.has(dateStr)) {
      return availabilities[dateStr] || { available_count: 0, available_slots: [] };
    }

    try {
      // Mark this date as loading
      setLoadingDates(prev => new Set([...prev, dateStr]));
      if (selectedDate && formatDateForAPI(selectedDate) === dateStr) {
        setLoadingAvailabilities(true);
      }

      // Fetch bookings for this specific date using the new books API (same query as profile page)
      const response = await fetch(`/api/bookings?practitioner_id=${id}&date=${dateStr}&status=confirmed`);

      if (response.ok) {
        const result = await response.json();
        const bookings = result.bookings || [];

        // Define all possible time slots (same as in profile page)
        const allTimeSlots = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

        // Get only available slots (exclude booked and blocked) - same logic as profile page
        const availableSlots = allTimeSlots.filter(slot => {
          const isBooked = bookings.some(booking => booking.time === slot);
          return !isBooked; // Only show available slots
        });

        // Create availability data for this date
        const availabilityData = {
          date: dateStr,
          dateObj: date,
          available_slots: availableSlots.map(slot => {
            // Convert to display format (same as profile page)
            const hour = parseInt(slot.split(':')[0]);
            if (hour < 12) {
              return `${hour}:00 AM`;
            } else {
              return `${hour - 12}:00 PM`;
            }
          }),
          available_count: availableSlots.length
        };

        // Update state with new data
        setAvailabilities(prev => ({
          ...prev,
          [dateStr]: availabilityData
        }));

        return availabilityData;
      }
    } catch (error) {
      console.error(`Error fetching bookings for ${dateStr}:`, error);

      // Create empty availability data on error
      const emptyData = {
        date: dateStr,
        dateObj: date,
        available_slots: [],
        available_count: 0
      };

      setAvailabilities(prev => ({
        ...prev,
        [dateStr]: emptyData
      }));

      return emptyData;
    } finally {
      // Remove from loading set
      setLoadingDates(prev => {
        const newSet = new Set(prev);
        newSet.delete(dateStr);
        return newSet;
      });
      if (selectedDate && formatDateForAPI(selectedDate) === dateStr) {
        setLoadingAvailabilities(false);
      }
    }
  }, [availabilities, loadingDates, selectedDate, setLoadingDates, setLoadingAvailabilities, setAvailabilities, formatDateForAPI]);

  // Function to geocode address using Google Geocoding API
  const geocodeAddress = async (address: string): Promise<{ lat: number, lng: number } | null> => {
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
    } catch {
      toast.error('Error geocoding address');
      return null;
    }
  };

  // Effect to geocode practitioner address
  useEffect(() => {
    const geocodePractitionerAddress = async () => {
      if (!practitioner?.address || typeof window === 'undefined' || !window.google) {
        return;
      }

      // Only geocode if we don't already have the location
      if (practitionerLocation) return;

      const coordinates = await geocodeAddress(practitioner.address);
      if (coordinates) {
        setPractitionerLocation(coordinates);
      }
    };

    // Delay execution to ensure Google Maps is loaded
    const timer = setTimeout(geocodePractitionerAddress, 1000);
    return () => clearTimeout(timer);
  }, [practitioner?.address, practitionerLocation]);

  // Get the map center - use geocoded location if available, otherwise default to Vancouver
  const mapCenter = practitionerLocation || defaultCenter;

  const tabs = ['About', 'Location', 'Events', 'Reviews', 'Services, Pricing and Appointments'];

  // Calendar helper functions (matching profile page)
  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const generateCalendarDates = useCallback(() => {
    const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const lastDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
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
  }, [selectedMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedMonth(newDate);
  };

  const isDateInCurrentMonth = (date: Date) => {
    return date.getMonth() === selectedMonth.getMonth() &&
           date.getFullYear() === selectedMonth.getFullYear();
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isDateToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getDateAvailability = (date: Date) => {
    const dateStr = formatDateForAPI(date);
    return availabilities[dateStr] || { available_count: 0, available_slots: [] };
  };

  const hasAvailability = (date: Date) => {
    const availability = getDateAvailability(date);
    return availability.available_count > 0;
  };


  if (loading) {
    return <PractitionerDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error loading practitioner: {error}</div>
      </div>
    );
  }

  if (!practitioner) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-body-color">Practitioner not found</div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-gray-50 pt-[120px]">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-8 mb-6">
          <div className="grid lg:grid-cols-3 gap-8 min-h-[500px]">
            {/* Left Side - Video */}
            <div className="lg:col-span-1 h-full">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                {practitioner.video ? (
                  <video
                    src={practitioner.video}
                    controls
                    className="absolute inset-0 h-full w-full rounded-2xl object-cover"
                    title={`${practitioner.full_name} spotlight video`}
                  />
                ) : (
                  <div className="absolute inset-0 h-full w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium">No Video Available</p>
                      <p className="text-sm mt-1">This practitioner hasn&apos;t uploaded a video yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Profile Info */}
            <div className="lg:col-span-2 h-full">
              <div >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
                  {/* Profile Image */}
                  <div className="lg:col-span-1 flex flex-col">
                    <div className="flex justify-center">
                      <Image
                        src={practitioner.avatar.url}
                        alt={practitioner.avatar.alt}
                        width={300}
                        height={300}
                        className="w-48 h-48 object-cover rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h1 className="text-4xl font-bold text-green-700 mb-3">
                        {practitioner.title ? `${practitioner.title} ` : ''}{practitioner.full_name}
                      </h1>
                      <div className="flex items-start mb-3">
                        <div className="flex flex-wrap gap-2">
                          {practitioner.specialties && practitioner.specialties.length > 0 ? (
                            practitioner.specialties.map((specialty, index) => (
                              <span
                                key={index}
                                className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20"
                              >
                                {specialty}
                              </span>
                            ))
                          ) : (
                            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20">
                              {practitioner.specialty || 'General Practice'}
                            </span>
                          )}
                        </div>
                      </div>
                      {practitioner.degrees && (
                        <div className="flex items-center mb-4">
                          <CheckCircle className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-sm text-gray-500">{practitioner.degrees}</p>
                        </div>
                      )}

                      <div className="mb-4">
                        {/* Contact Information */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div className="space-y-2 text-sm text-gray-600 mb-4 md:mb-0">
                            {practitioner.address && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                <span>{practitioner.address}</span>
                              </div>
                            )}
                            {practitioner.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                <a
                                  href={`tel:${practitioner.phone}`}
                                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                >
                                  {formatPhoneNumber(practitioner.phone)}
                                </a>
                              </div>
                            )}
                            {practitioner.email && (
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                <a
                                  href={`mailto:${practitioner.email}`}
                                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                >
                                  {practitioner.email}
                                </a>
                              </div>
                            )}
                            {practitioner.website && (
                              <div className="flex items-center">
                                <Globe className="w-4 h-4 text-gray-400 mr-2" />
                                <a
                                  href={practitioner.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                >
                                  {practitioner.website}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Social Media Icons and Button - Desktop Only */}
                          <div className="hidden lg:flex flex-col space-y-3">
                            {/* Dynamic Social Media Icons */}
                            {(() => {
                              const socialLinks = [];

                              // Facebook
                              if (practitioner.facebook) {
                                socialLinks.push(
                                  <Link
                                    key="facebook"
                                    href={practitioner.facebook.startsWith('http') ? practitioner.facebook : `https://${practitioner.facebook}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                  >
                                    <Image
                                      src="/images/social/facebook.png"
                                      width={32}
                                      height={32}
                                      alt="Facebook"
                                      className="w-6 h-6 object-contain"
                                    />
                                  </Link>
                                );
                              }

                              // Instagram
                              if (practitioner.instagram) {
                                socialLinks.push(
                                  <Link
                                    key="instagram"
                                    href={practitioner.instagram.startsWith('http') ? practitioner.instagram : `https://${practitioner.instagram}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                  >
                                    <Image
                                      src="/images/social/instagram.png"
                                      width={32}
                                      height={32}
                                      alt="Instagram"
                                      className="w-6 h-6 object-contain"
                                    />
                                  </Link>
                                );
                              }

                              // YouTube
                              if (practitioner.youtube) {
                                socialLinks.push(
                                  <Link
                                    key="youtube"
                                    href={practitioner.youtube.startsWith('http') ? practitioner.youtube : `https://${practitioner.youtube}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                  >
                                    <Image
                                      src="/images/social/youtube.png"
                                      width={32}
                                      height={32}
                                      alt="YouTube"
                                      className="w-6 h-6 object-contain"
                                    />
                                  </Link>
                                );
                              }

                              // Twitter/X
                              if (practitioner.twitter) {
                                socialLinks.push(
                                  <Link
                                    key="twitter"
                                    href={practitioner.twitter.startsWith('http') ? practitioner.twitter : `https://${practitioner.twitter}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                  >
                                    <Image
                                      src="/images/social/twitter.png"
                                      width={32}
                                      height={32}
                                      alt="Twitter"
                                      className="w-6 h-6 object-contain"
                                    />
                                  </Link>
                                );
                              }

                              // LinkedIn
                              if (practitioner.linkedin) {
                                socialLinks.push(
                                  <Link
                                    key="linkedin"
                                    href={practitioner.linkedin.startsWith('http') ? practitioner.linkedin : `https://${practitioner.linkedin}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                  >
                                    <Image
                                      src="/images/social/linkedin.png"
                                      width={32}
                                      height={32}
                                      alt="LinkedIn"
                                      className="w-6 h-6 object-contain"
                                    />
                                  </Link>
                                );
                              }

                              return socialLinks.length > 0 ? (
                                <div className="flex space-x-2">
                                  {socialLinks}
                                </div>
                              ) : null;
                            })()}
                            <BookAppointmentButton
                              practitionerId={practitioner.id}
                              user={user}
                            />
                          </div>
                        </div>

                        {/* Social Media Icons and Button - Mobile Only */}
                        <div className="lg:hidden mt-4 space-y-3">
                          {/* Dynamic Social Media Icons - Mobile */}
                          {(() => {
                            const socialLinks = [];

                            // Facebook
                            if (practitioner.facebook) {
                              socialLinks.push(
                                <Link
                                  key="facebook"
                                  href={practitioner.facebook.startsWith('http') ? practitioner.facebook : `https://${practitioner.facebook}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                  <Image
                                    src="/images/social/facebook.png"
                                    width={32}
                                    height={32}
                                    alt="Facebook"
                                    className="w-6 h-6 object-contain"
                                  />
                                </Link>
                              );
                            }

                            // Instagram
                            if (practitioner.instagram) {
                              socialLinks.push(
                                <Link
                                  key="instagram"
                                  href={practitioner.instagram.startsWith('http') ? practitioner.instagram : `https://${practitioner.instagram}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                  <Image
                                    src="/images/social/instagram.png"
                                    width={32}
                                    height={32}
                                    alt="Instagram"
                                    className="w-6 h-6 object-contain"
                                  />
                                </Link>
                              );
                            }

                            // YouTube
                            if (practitioner.youtube) {
                              socialLinks.push(
                                <Link
                                  key="youtube"
                                  href={practitioner.youtube.startsWith('http') ? practitioner.youtube : `https://${practitioner.youtube}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                  <Image
                                    src="/images/social/youtube.png"
                                    width={32}
                                    height={32}
                                    alt="YouTube"
                                    className="w-6 h-6 object-contain"
                                  />
                                </Link>
                              );
                            }

                            // Twitter/X
                            if (practitioner.twitter) {
                              socialLinks.push(
                                <Link
                                  key="twitter"
                                  href={practitioner.twitter.startsWith('http') ? practitioner.twitter : `https://${practitioner.twitter}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                  <Image
                                    src="/images/social/twitter.png"
                                    width={32}
                                    height={32}
                                    alt="Twitter"
                                    className="w-6 h-6 object-contain"
                                  />
                                </Link>
                              );
                            }

                            // LinkedIn
                            if (practitioner.linkedin) {
                              socialLinks.push(
                                <Link
                                  key="linkedin"
                                  href={practitioner.linkedin.startsWith('http') ? practitioner.linkedin : `https://${practitioner.linkedin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                >
                                  <Image
                                    src="/images/social/linkedin.png"
                                    width={32}
                                    height={32}
                                    alt="LinkedIn"
                                    className="w-6 h-6 object-contain"
                                  />
                                </Link>
                              );
                            }

                            return socialLinks.length > 0 ? (
                              <div className="flex justify-center space-x-2">
                                {socialLinks}
                              </div>
                            ) : null;
                          })()}
                          <div className="flex justify-start lg:justify-center">
                            <BookAppointmentButton
                              practitionerId={practitioner.id}
                              user={user}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photo Gallery Section - Under Right Side */}
                <div className="gap-8 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Photos & Videos</h3>
                    {/* Photo Gallery Grid - Real Images from Database */}
                    {practitioner?.images && practitioner.images.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {practitioner.images.length} image{practitioner.images.length !== 1 ? 's' : ''}
                              {practitioner.video && ' • 1 video'}
                            </span>
                          </div>
                          {practitioner.images.length > 5 && (
                            <button
                              onClick={() => setShowAllMediaModal(true)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                            >
                              +{practitioner.images.length - 5} More
                            </button>
                          )}
                        </div>

                        {/* Flexible Image Layout based on count (images only) */}
                        {(() => {
                          const totalImages = practitioner.images.length;

                          // Layout for 1 image
                          if (totalImages === 1) {
                            return (
                              <div
                                className="h-48 md:h-64 overflow-hidden rounded-lg relative cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setSelectedImageIndex(0)}
                              >
                                <Image
                                  src={practitioner.images[0]}
                                  alt={`${practitioner.full_name} photo`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            );
                          }

                          // Layout for 2 images
                          if (totalImages === 2) {
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-48 md:h-48">
                                {practitioner.images.slice(0, 2).map((imageUrl, index) => (
                                  <div
                                    key={index}
                                    className="relative overflow-hidden rounded-lg h-full cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setSelectedImageIndex(index)}
                                  >
                                    <Image
                                      src={imageUrl}
                                      alt={`${practitioner.full_name} photo ${index + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            );
                          }

                          // Layout for 3 images
                          if (totalImages === 3) {
                            return (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-48">
                                {practitioner.images.slice(0, 3).map((imageUrl, index) => (
                                  <div
                                    key={index}
                                    className="relative overflow-hidden rounded-lg h-full cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setSelectedImageIndex(index)}
                                  >
                                    <Image
                                      src={imageUrl}
                                      alt={`${practitioner.full_name} photo ${index + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            );
                          }

                          // Layout for 4+ images - Responsive grid
                          return (
                            <div className="w-full">
                              {/* Mobile: Single column stack */}
                              <div className="block md:hidden space-y-3">
                                <div
                                  className="aspect-video overflow-hidden rounded-lg relative cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setSelectedImageIndex(0)}
                                >
                                  <Image
                                    src={practitioner.images[0]}
                                    alt={`${practitioner.full_name} main photo`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  {practitioner.images.slice(1, 4).map((imageUrl, index) => (
                                    <div
                                      key={index + 1}
                                      className="aspect-square relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => setSelectedImageIndex(index + 1)}
                                    >
                                      <Image
                                        src={imageUrl}
                                        alt={`${practitioner.full_name} photo ${index + 2}`}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Desktop: 5-column grid with large image */}
                              <div className="hidden md:block">
                                <div className="grid grid-cols-5 gap-3 h-48">
                                  {/* Large Image - 2 columns */}
                                  <div
                                    className="col-span-2 h-full overflow-hidden rounded-lg relative cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setSelectedImageIndex(0)}
                                  >
                                    <Image
                                      src={practitioner.images[0]}
                                      alt={`${practitioner.full_name} main photo`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>

                                  {/* Small Images Grid - 3 columns, 2 rows (images only) */}
                                  <div className="col-span-3 grid grid-cols-2 gap-2 h-full">
                                    {/* Show remaining images (max 5 total display) */}
                                    {practitioner.images.slice(1, 5).map((imageUrl, index) => (
                                      <div
                                        key={index + 1}
                                        className="w-full h-full relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setSelectedImageIndex(index + 1)}
                                      >
                                        <Image
                                          src={imageUrl}
                                          alt={`${practitioner.full_name} photo ${index + 2}`}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    ))}

                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <p className="text-gray-500">No media available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {selectedImageIndex !== null && practitioner.images && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImageIndex(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <Image
                src={practitioner.images[selectedImageIndex]}
                alt={`${practitioner.full_name} practice image ${selectedImageIndex + 1}`}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-black" />
              </button>
              {/* Navigation arrows */}
              {practitioner.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : practitioner.images.length - 1);
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-black" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(selectedImageIndex < practitioner.images.length - 1 ? selectedImageIndex + 1 : 0);
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-black" />
                  </button>
                </>
              )}
              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {practitioner.images.length}
              </div>
            </div>
          </div>
        )}

        {/* See All Media Modal */}
        {showAllMediaModal && practitioner && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAllMediaModal(false)}
          >
            <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-lg overflow-hidden"
                 onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {practitioner.full_name}&apos;s Media Gallery
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {practitioner.images?.length || 0} image{(practitioner.images?.length || 0) !== 1 ? 's' : ''}
                    {practitioner.video && ' • 1 video'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAllMediaModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Media Grid with Scroll */}
              <div className="p-4 overflow-y-auto" style={{ height: 'calc(90vh - 120px)' }}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Video first if available */}
                  {practitioner.video && (
                    <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-900">
                      <video
                        src={practitioner.video}
                        controls
                        className="w-full h-full object-cover"
                        poster={practitioner.images?.[0]}
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        VIDEO
                      </div>
                    </div>
                  )}

                  {/* All Images */}
                  {practitioner.images?.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="aspect-square relative cursor-pointer group overflow-hidden rounded-lg bg-gray-200"
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setShowAllMediaModal(false);
                      }}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${practitioner.full_name} practice image ${index + 1}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {(!practitioner.images || practitioner.images.length === 0) && !practitioner.video && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">No media available</p>
                    <p className="text-gray-400 text-sm mt-1">This practitioner hasn&apos;t uploaded any photos or videos yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 navigation-tabs">
          <div className="relative">
            <div className="flex border-b overflow-x-auto overflow-y-hidden" style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {tabs.map((tab) => (
                <button
                  key={tab}
                  data-tab={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 md:px-8 py-4 font-medium transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === tab
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Fade gradient on mobile to indicate scrollable content */}
            <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden"></div>
          </div>

          {/* Tab Content */}
          <div className="p-4 md:p-8">
            {activeTab === 'About' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 order-2 lg:order-1">
                  <div className="space-y-8">
                    {/* Main About Section */}
                    <div>
                      <h3 className="text-2xl font-bold text-orange-500 mb-4">About {practitioner.full_name}</h3>
                      <div className="text-gray-700 leading-relaxed">
                        {practitioner.about ? (
                          <div dangerouslySetInnerHTML={{ __html: practitioner.about }} />
                        ) : (
                          <p>No about information provided.</p>
                        )}
                      </div>
                    </div>

                    {/* Languages */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Languages</h3>
                      <div className="flex space-x-2 text-gray-700">
                        {practitioner.languages && practitioner.languages.length > 0 ? (
                          Array.isArray(practitioner.languages) ? (
                            practitioner.languages.map((language, index) => (
                              <p key={index} className='bg-blue-100 text-blue-800 rounded-full px-4 py-1'>{language}</p>
                            ))
                          ) : (
                            <p>{practitioner.languages}</p>
                          )
                        ) : (
                          <p>English</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="bg-gray-50 rounded-xl p-4 lg:p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4">What I Treat About</h4>

                    <div className="space-y-2">
                      {practitioner.specialties && practitioner.specialties.length > 0 ? (
                        practitioner.specialties.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            {item}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          General Practice
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">What To Expect On Your First Visit</h4>
                    <p className="text-sm text-gray-600">
                      Your first visit will include a comprehensive consultation and treatment plan discussion.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Location' && (
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
                                            {practitioner.rating > 0 ? `${practitioner.rating?.toFixed(1)} (${practitioner.reviews} reviews)` : 'No reviews'}
                                          </span>
                                        </div>
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
            )}

            {activeTab === 'Events' && (
              <div>
                <div className=" mb-6">
                  {/* Header with gradient */}

                  <div>
                    <h3 className="text-2xl font-bold text-orange-500 mb-4">Event/Webinar</h3>
                  </div>
                  {/* Event Card */}
                  <div className="relative">
                    {/* Hero Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src="/images/home/webinars.png"
                        alt="Gua Sha Workshop"
                        width={800}
                        height={300}
                        className="w-full h-full rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 bg-black/10"></div>
                    </div>

                    {/* Event Content */}
                    <div className="p-4 md:p-6">
                      <div className="mb-4">
                        <div className="flex-1">
                          <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4'>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                              Beginner Gua Sha Workshop
                            </h3>
                            <h4 className="text-lg md:text-2xl font-bold text-gray-900">
                              Sat, Sept 2, 2025, 2-5pm
                            </h4>
                          </div>

                          <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-4'>
                            <div className="text-sm font-semibold text-gray-900">FEE: <span className="text-lg font-bold text-orange-600">$60</span></div>
                            <div className="text-sm font-semibold text-gray-900">
                              LOCATION:
                              <div className="text-gray-700 flex items-center gap-1 mt-1">
                                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                <span className="text-xs md:text-sm">756 Park Ave, Suite 2300, New York, NY</span>
                              </div>
                            </div>
                          </div>
                          <div className="mb-6">
                            <p className="text-gray-700 leading-relaxed pt-6">
                              Gua Sha has been used for thousands of years to drain lymph nodes create better circulation and many other health benefits. It has been known to be a great anti-aging tool. Learn how to do it properly! Come join us!
                            </p>
                          </div>

                          <div className="flex justify-center gap-3">
                            <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2">
                              YES! I WANT TO REGISTER
                            </button>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Reviews' && (
              <div>
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-orange-500 mb-4 md:mb-6">Reviews</h3>
                  </div>

                  {/* Rating Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                    {/* Overall Rating */}
                    <div className="text-center">
                      <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">4.9</div>
                      <div className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Overall</div>
                      <div className="flex justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Care + Service */}
                    <div className="text-center">
                      <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">5.0</div>
                      <div className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Care + Service</div>
                      <div className="flex justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Wait Time */}
                    <div className="text-center">
                      <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">4.8</div>
                      <div className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Wait Time</div>
                      <div className="flex justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 md:w-4 md:h-4 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Office Environment */}
                    <div className="text-center">
                      <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">4.9</div>
                      <div className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Office Environment</div>
                      <div className="flex justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-4 md:space-y-6">
                    {/* Review 1 */}
                    <div className="border-b border-gray-200 pb-4 md:pb-6">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          A
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                            <span className="text-xs md:text-sm text-gray-500">• 2 weeks ago</span>
                          </div>
                          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                            I experienced a 30 minute acupuncture session at the Harlem Wellness Fair this past weekend. It was such a meditative experience. Special shoutout to Johanne for accommodating everyone with ease and grace even as the rain poured down around us. While I didn&apos;t have any specific pain to target, Johanne was able to pin point prime area for deep relaxation in mind, body, and soul. I travelled to another place while sitting in the middle of Marcus Garvey park with rain pouring, cool wind blowing, and other clients approaching the tent. I look forward to connecting with Harlem Chi for a longer session in the near future.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Review 2 */}
                    <div className="border-b border-gray-200 pb-4 md:pb-6">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          M
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                            <span className="text-xs md:text-sm text-gray-500">• 1 month ago</span>
                          </div>
                          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                            I experienced a 30 minute acupuncture session at the Harlem Wellness Fair this past weekend. It was such a meditative experience. Special shoutout to Johanne for accommodating everyone with ease and grace even as the rain poured down around us. While I didn&apos;t have any specific pain to target, Johanne was able to pin point prime area for deep relaxation in mind, body, and soul. I travelled to another place while sitting in the middle of Marcus Garvey park with rain pouring, cool wind blowing, and other clients approaching the tent. I look forward to connecting with Harlem Chi for a longer session in the near future.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Review 3 */}
                    <div className="border-b border-gray-200 pb-4 md:pb-6">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          S
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                            <span className="text-xs md:text-sm text-gray-500">• 2 months ago</span>
                          </div>
                          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                            I experienced a 30 minute acupuncture session at the Harlem Wellness Fair this past weekend. It was such a meditative experience. Special shoutout to Johanne for accommodating everyone with ease and grace even as the rain poured down around us. While I didn&apos;t have any specific pain to target, Johanne was able to pin point prime area for deep relaxation in mind, body, and soul. I travelled to another place while sitting in the middle of Marcus Garvey park with rain pouring, cool wind blowing, and other clients approaching the tent. I look forward to connecting with Harlem Chi for a longer session in the near future.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* More Reviews Button */}
                  <div className="text-center pt-4">
                    <button className="text-blue-600 hover:underline font-medium text-sm md:text-base">
                      More Google Reviews
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'Services, Pricing and Appointments' && (
              <div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-orange-500 mb-4 md:mb-6">Services, Pricing and Appointments</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* Left Side - Services and Pricing */}
                  <div className="lg:col-span-1 space-y-4 md:space-y-6">
                    {/* Combined Services and Pricing Section */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Available Services & Rates</h4>

                      {practitioner?.specialty_rate && Object.keys(practitioner.specialty_rate).length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(practitioner.specialty_rate).map(([specialty, rate]) => (
                            <div key={specialty} className="flex justify-between items-center py-3 border-b border-gray-100">
                              <div className="flex-1">
                                <div className="text-base font-medium text-gray-900">{specialty}</div>
                                <div className="text-sm text-gray-500 mt-1">Professional treatment and consultation</div>
                              </div>
                              <div className="text-lg font-bold text-gray-900">${Number(rate)}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <div className="flex-1">
                              <div className="text-base font-medium text-gray-900">General Consultation</div>
                              <div className="text-sm text-gray-500 mt-1">Comprehensive health assessment and treatment planning</div>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {practitioner?.rate ? `$${practitioner.rate}` : 'Contact for pricing'}
                            </div>
                          </div>
                          {practitioner?.specialties?.map((specialty) => (
                            <div key={specialty} className="flex justify-between items-center py-3 border-b border-gray-100">
                              <div className="flex-1">
                                <div className="text-base font-medium text-gray-900">{specialty}</div>
                                <div className="text-sm text-gray-500 mt-1">Specialized treatment and care</div>
                              </div>
                              <div className="text-lg font-bold text-gray-900">
                                {practitioner?.rate ? `$${practitioner.rate}` : 'Contact for pricing'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Insurance Information */}
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 md:p-6">
                      <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                        INSURANCE
                      </h4>
                      <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                        We currently do not directly bill insurance. If you would like to submit a receipt to your insurance company, we can generate an invoice for you.
                      </p>
                    </div>
                  </div>

                  {/* Right Side - Calendar and Time Slots */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Calendar - Matching profile page design */}
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
                          <h3 className="text-lg font-semibold text-gray-800">
                            {formatMonth(selectedMonth)}
                          </h3>
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
                              const isCurrentMonth = isDateInCurrentMonth(date);
                              const hasSlots = hasAvailability(date);

                              return (
                                <button
                                  key={index}
                                  onClick={() => setSelectedDate(date)}
                                  className={`
                                    p-2 text-sm rounded-lg transition-all relative
                                    ${!isCurrentMonth ? 'text-gray-300' : ''}
                                    ${isDateSelected(date)
                                      ? 'bg-blue-500 text-white font-semibold border-2 border-blue-600'
                                      : hasSlots
                                      ? 'bg-green-100 border-2 border-green-400 text-green-700 font-bold hover:bg-green-200'
                                      : 'hover:bg-gray-100'
                                    }
                                    ${isDateToday(date) && !isDateSelected(date)
                                      ? 'bg-blue-100 text-blue-700 font-medium'
                                      : !isDateSelected(date) && isCurrentMonth ? 'text-gray-700' : ''
                                    }
                                  `}
                                >
                                  {date.getDate()}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Time Slots for Selected Date */}
                      <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-6">
                        {selectedDate && (
                          <div className="mt-6 p-4 bg-blue-50 rounded-lg mb-6">
                            <h4 className="font-medium text-blue-900 mb-1">Selected Date</h4>
                            <p className="text-blue-700">
                              {selectedDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <div className="mt-2 text-sm text-blue-600">
                              {loadingAvailabilities ? (
                                'Loading availability...'
                              ) : (
                                `Available slots: ${getDateAvailability(selectedDate).available_count} / 8`
                              )}
                            </div>
                          </div>
                        )}

                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {selectedDate ? (
                            `Time Slots for ${selectedDate.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}`
                          ) : (
                            'Select a Date'
                          )}
                        </h3>

                        {loadingAvailabilities ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="text-gray-500">Loading availability...</div>
                          </div>
                        ) : selectedDate ? (
                          (() => {
                            const availability = getDateAvailability(selectedDate);
                            const morningSlots = availability.available_slots.filter(slot =>
                              slot.includes('AM') || slot === '12:00 PM'
                            );
                            const afternoonSlots = availability.available_slots.filter(slot =>
                              slot.includes('PM') && slot !== '12:00 PM'
                            );

                            return (
                              <div className="space-y-4">
                                {/* Morning Slots */}
                                {morningSlots.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Morning</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {morningSlots.map((slot, index) => (
                                        <button
                                          key={index}
                                          className="p-3 text-sm border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
                                        >
                                          {slot}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Afternoon Slots */}
                                {afternoonSlots.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Afternoon</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {afternoonSlots.map((slot, index) => (
                                        <button
                                          key={index}
                                          className="p-3 text-sm border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
                                        >
                                          {slot}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {availability.available_slots.length === 0 && (
                                  <div className="text-center py-8 text-gray-500">
                                    <div className="mb-2">No available slots</div>
                                    <div className="text-sm">This date is fully booked</div>
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <div className="mb-2">Select a date</div>
                            <div className="text-sm">Choose a date from the calendar to see available times</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Book An Appointment Button */}
                    <div className="mt-6 text-center">
                      <BookAppointmentButton
                        practitionerId={practitioner?.id || ''}
                        user={user}
                        onServicesTab={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PractitionerDetailsPage;