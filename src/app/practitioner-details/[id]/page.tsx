"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';

// Import components
import { PractitionerDetailsSkeleton } from './components/PractitionerDetailsSkeleton';
import { Header } from './components/Header';
import { About } from './components/About';
import { Location } from './components/Location';
import { Events } from './components/Events';
import { Reviews } from './components/Reviews';
import { ServicesPricing } from './components/ServicesPricing';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

const PractitionerDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [practitioner, setPractitioner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('About');
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [practitionerLocation, setPractitionerLocation] = useState(null);
  const [descriptionsData, setDescriptionsData] = useState<any>(null);

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
        if (hash === '#services') {
          setActiveTab('Services & Pricing');
          // Scroll to the tabs section after a short delay to ensure DOM is ready
          setTimeout(() => {
            const tabsElement = document.querySelector('.navigation-tabs');
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
      if (hash === '#services' && activeTab !== 'Services & Pricing') {
        setActiveTab('Services & Pricing');
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
      if (!practitionerId) {
        return;
      }


      try {
        setLoading(true);
        setError(null);

        // Fetch practitioner data from Users table
        const { supabase } = await import('@/lib/supabase');

        const { data: found, error: userError } = await supabase
          .from('Users')
          .select(`
            id,
            firstname,
            lastname,
            email,
            phone,
            address,
            avatar,
            type,
            ptype,
            degree,
            clinic,
            website,
            title,
            clinicpage
          `)
          .eq('id', practitionerId)
          .maybeSingle();

        if (userError) {
          setError(`Error loading practitioner data: ${userError.message}`);
          return;
        }

        if (!found) {
          setError('Practitioner not found');
          return;
        }

        // Verify this is a practitioner
        if (found.type?.toLowerCase() !== 'practitioner' && found.ptype?.toLowerCase() !== 'practitioner') {
          setError('This user is not a practitioner');
          return;
        }

        // Fetch media from UserMedia table
        const { data: mediaData, error: mediaError } = await supabase
          .from('UserMedia')
          .select('id, user_id, file_url, file_type, display_order, created_at')
          .eq('user_id', practitionerId)
          .order('display_order', { ascending: true });

        if (mediaError) {
        } else {
        }

        // Separate images and video from UserMedia
        const userImages = mediaData
          ?.filter(item => item.file_type === 'image')
          .map(item => item.file_url) || [];
        const userVideo = mediaData?.find(item => item.file_type === 'video')?.file_url || null;


        // Process JSON fields from Users table
        const processedUser = {
          ...found,
          // Compute full_name from firstname and lastname
          full_name: found.firstname && found.lastname
            ? `${found.firstname} ${found.lastname}`.trim()
            : found.firstname || found.lastname || '',
          firstname: found.firstname || '',
          lastname: found.lastname || '',
          title: found.title || '',
          degree: found.degree || '',
          languages: [], // Languages will be fetched from Descriptions table
          bio: '', // Bio not stored in Users table
          aboutme: '', // About me not stored in Users table
        };

        // Fetch descriptions data from Descriptions table
        let languagesFromDescriptions = [];
        try {
          const { data: descriptionsResult, error: descError } = await supabase
            .from('Descriptions')
            .select('id, user_id, background, education, treatment, firstVisit, insurance, cancellation, language, created_at')
            .eq('user_id', practitionerId)
            .maybeSingle();

          if (descError) {
          } else if (descriptionsResult) {
            // Parse language field if it's a string
            if (descriptionsResult.language) {
              descriptionsResult.language = typeof descriptionsResult.language === 'string'
                ? JSON.parse(descriptionsResult.language)
                : descriptionsResult.language;
              // Extract languages array
              languagesFromDescriptions = Array.isArray(descriptionsResult.language)
                ? descriptionsResult.language
                : [descriptionsResult.language];
            }
            setDescriptionsData(descriptionsResult);
          } else {
          }
        } catch (descError) {
        }

        // Update processedUser with languages from Descriptions
        processedUser.languages = languagesFromDescriptions.length > 0 ? languagesFromDescriptions : ['English'];

        // Transform the data for the detail page
        const transformedPractitioner = {
          ...processedUser,
          avatar: {
            url: processedUser.avatar || "https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg",
            alt: processedUser.full_name || "Practitioner"
          },
          // Media fields from UserMedia table
          video: userVideo,
          images: userImages,
          degree: processedUser.degree || '',
          languages: Array.isArray(processedUser.languages) ? processedUser.languages : (processedUser.languages ? [processedUser.languages] : ['English']),
          clinic: processedUser.clinic || 'Private Practice',
          address: processedUser.address || 'Address not available',
          specialty: processedUser.ptype || '',
          bio: processedUser.bio || '',
          aboutme: processedUser.aboutme || '',
          successRate: `${Math.floor(Math.random() * 20) + 80}%`,
          totalPatients: Math.floor(Math.random() * 300) + 100,
          nextAvailable: `${Math.floor(Math.random() * 12) + 8}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'} - ${Math.floor(Math.random() * 28) + 1} ${['Jan', 'Feb', 'Mar', 'Apr', 'May'][Math.floor(Math.random() * 5)]}`,
          verified: Math.random() > 0.3,
          // Extended fields for detail page - use actual specialties from database
          specialties: (() => {
            if (!processedUser.ptype) return ['General Practice'];

            // Handle if ptype is already an array
            if (Array.isArray(processedUser.ptype)) {
              const filtered = processedUser.ptype.filter(s => s && s.trim() !== '');
              return filtered.length > 0 ? filtered : ['General Practice'];
            }

            // Handle if ptype is a string
            if (typeof processedUser.ptype === 'string') {
              const trimmed = processedUser.ptype.trim();
              if (!trimmed) return ['General Practice'];

              // Try to parse as JSON array
              if (trimmed.startsWith('[')) {
                try {
                  const parsed = JSON.parse(trimmed);
                  if (Array.isArray(parsed)) {
                    const filtered = parsed.filter(s => s && s.trim() !== '');
                    return filtered.length > 0 ? filtered : ['General Practice'];
                  }
                } catch {
                  // If JSON parsing fails, continue to treat as regular string
                }
              }

              // Handle comma-separated specialties
              if (trimmed.includes(',')) {
                const specialties = trimmed.split(',').map(s => s.trim()).filter(s => s !== '');
                return specialties.length > 0 ? specialties : ['General Practice'];
              }

              // Single specialty string
              return [trimmed];
            }

            return ['General Practice'];
          })(),
          services: [
            { name: 'Initial Consultation', duration: '60min', price: 100 },
            { name: 'Follow-up Session', duration: '45min', price: 50 },
            { name: 'Package Deal (3 sessions)', duration: '45min', price: 125 },
            { name: 'Specialized Treatment', duration: '30min', price: 75 }
          ],
          about: processedUser.aboutme || (() => {
            // Extract real data from database
            const specialtyText = (() => {
              if (!processedUser.ptype) return 'General Healthcare';
              if (typeof processedUser.ptype === 'string') {
                try {
                  const parsed = JSON.parse(processedUser.ptype);
                  return Array.isArray(parsed) ? parsed.join(', ') : processedUser.ptype;
                } catch {
                  return processedUser.ptype;
                }
              }
              return Array.isArray(processedUser.ptype) ? processedUser.ptype.join(', ') : 'General Healthcare';
            })();

            const degreesText = processedUser.degree || 'Licensed Healthcare Professional';

            const locationText = processedUser.address || 'Available for consultations';
            const languagesText = (() => {
              if (!processedUser.languages || (Array.isArray(processedUser.languages) && processedUser.languages.length === 0)) {
                return 'English';
              }
              return Array.isArray(processedUser.languages) ? processedUser.languages.join(', ') : processedUser.languages;
            })();

            // Safe name variables with null checks
            const fullName = processedUser.full_name || 'This practitioner';
            const firstName = fullName.split(' ')[0] || fullName;

            return `<div class="space-y-6">
              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Professional Background</h4>
                <p class="text-gray-700 leading-relaxed">${fullName} is a dedicated healthcare professional specializing in ${specialtyText}. Based in ${locationText}, ${firstName} is committed to providing exceptional patient care and delivering outstanding therapeutic outcomes.</p>
              </div>

              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Education & Credentials</h4>
                <p class="text-gray-700 leading-relaxed"><strong>Qualifications:</strong> ${degreesText}</p>
                <p class="text-gray-700 leading-relaxed mt-2">Maintains active professional memberships and continuing education to stay current with the latest advancements in ${specialtyText.toLowerCase()} and evidence-based healthcare practices.</p>
              </div>

              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Specialties</h4>
                <p class="text-gray-700 leading-relaxed">${specialtyText}</p>
              </div>

              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-3">Treatment Approach</h4>
                <p class="text-gray-700 leading-relaxed">My practice focuses on evidence-based treatments combined with compassionate, patient-centered care. I believe in building strong therapeutic relationships through clear communication, collaborative treatment planning, and respect for each patient's individual journey toward optimal health.</p>
              </div>
            </div>`;
          })(),
        };

        setPractitioner(transformedPractitioner);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Error loading practitioner: ${errorMessage}`);
        setError(`Failed to fetch practitioner: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPractitioner();
  }, [practitionerId]);

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
            resolve(null);
          }
        });
      });
    } catch (error) {
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

      // Validate address before geocoding
      const cleanAddress = practitioner.address.trim();

      // Skip geocoding for invalid addresses
      if (!cleanAddress ||
          cleanAddress === 'Address not available' ||
          cleanAddress === 'Not specified' ||
          /^[,\s]+$/.test(cleanAddress)) { // Only commas and spaces
        return;
      }

      const coordinates = await geocodeAddress(cleanAddress);
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

  const tabs = ['About', 'Location', 'Events', 'Reviews', 'Services & Pricing'];

  if (loading) {
    return <PractitionerDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 text-xl font-semibold mb-2">Error Loading Practitioner</div>
          <div className="text-gray-700 mb-4">{error}</div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Go Back
          </button>
        </div>
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
        <Header
          practitioner={practitioner}
          user={user}
          descriptionsData={descriptionsData}
        />

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
              <About practitioner={practitioner} descriptionsData={descriptionsData} />
            )}

            {activeTab === 'Location' && (
              <Location
                practitioner={practitioner}
                mapCenter={mapCenter}
                showInfoWindow={showInfoWindow}
                setShowInfoWindow={setShowInfoWindow}
              />
            )}

            {activeTab === 'Events' && <Events practitionerId={practitionerId} />}

            {activeTab === 'Reviews' && <Reviews />}
            {activeTab === 'Services & Pricing' && (
              <ServicesPricing practitioner={practitioner} descriptionsData={descriptionsData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PractitionerDetailsPage;