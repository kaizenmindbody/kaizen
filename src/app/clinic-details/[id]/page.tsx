"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

// Import components
import { ClinicDetailsSkeleton } from './components/ClinicDetailsSkeleton';
import { Header } from './components/Header';
import { About } from './components/About';
import { Location } from './components/Location';
import { ServicesPricing } from './components/ServicesPricing';
import { Practitioners } from './components/Practitioners';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface ClinicData {
  id: string;
  practitioner_id: string;
  clinic_name: string;
  clinic_website: string | null;
  clinic_phone: string | null;
  clinic_email: string | null;
  clinic_address: string | null;
  clinic_logo: string | null;
  clinic_video: string | null;
  clinic_images: string[];
  created_at: string;
  updated_at: string;
  // All practitioners working at this clinic
  practitioners?: {
    id: string;
    full_name: string;
    avatar: string;
    specialties: string[];
    degree: string;
    phone: string;
    email: string;
  }[];
}

const ClinicDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [clinicLocation, setClinicLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Google Maps configuration
  const defaultCenter = {
    lat: 49.2827, // Vancouver, BC coordinates
    lng: -123.1207
  };

  const clinicId = params.id as string;

  // Fetch clinic data
  useEffect(() => {
    const fetchClinic = async () => {
      if (!clinicId) return;

      try {
        setLoading(true);
        setError(null);

        const { supabase } = await import('@/lib/supabase');

        // Fetch clinic data
        const { data: clinicData, error: clinicError } = await supabase
          .from('Clinics')
          .select('*')
          .eq('id', clinicId)
          .single();

        if (clinicError || !clinicData) {
          setError('Clinic not found');
          return;
        }

        // Parse clinic_images if it's a JSON string
        const parsedImages = clinicData.clinic_images
          ? (typeof clinicData.clinic_images === 'string'
              ? JSON.parse(clinicData.clinic_images)
              : Array.isArray(clinicData.clinic_images)
                ? clinicData.clinic_images
                : [])
          : [];

        // Fetch all clinic members (practitioners working at this clinic)
        const { data: clinicMembers } = await supabase
          .from('ClinicMembers')
          .select('practitioner_id')
          .eq('clinic_id', clinicId);

        // Get IDs of all practitioners in the clinic
        const practitionerIds = clinicMembers?.map(m => m.practitioner_id) || [];

        // Fetch all practitioners info
        let practitioners = [];
        if (practitionerIds.length > 0) {
          const { data: practitionersData } = await supabase
            .from('Users')
            .select('id, firstname, lastname, avatar, ptype, degree, phone, email')
            .in('id', practitionerIds);

          if (practitionersData) {
            practitioners = practitionersData.map(p => {
              // Compute full_name
              const fullName = p.firstname && p.lastname
                ? `${p.firstname} ${p.lastname}`.trim()
                : p.firstname || p.lastname || '';

              // Parse ptype (practitioner type/specialty)
              let specialties = [];
              if (p.ptype) {
                if (typeof p.ptype === 'string') {
                  // Try to parse as JSON
                  if (p.ptype.startsWith('[')) {
                    try {
                      specialties = JSON.parse(p.ptype);
                    } catch {
                      specialties = [p.ptype];
                    }
                  } else if (p.ptype.includes(',')) {
                    // Comma-separated
                    specialties = p.ptype.split(',').map(s => s.trim());
                  } else {
                    // Single specialty
                    specialties = [p.ptype];
                  }
                } else if (Array.isArray(p.ptype)) {
                  specialties = p.ptype;
                }
              }

              return {
                id: p.id,
                full_name: fullName,
                avatar: p.avatar || 'https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg',
                specialties: specialties,
                degree: p.degree || '',
                phone: p.phone || '',
                email: p.email || ''
              };
            });
          }
        }

        const transformedClinic: ClinicData = {
          ...clinicData,
          clinic_images: parsedImages,
          practitioners: practitioners
        };

        setClinic(transformedClinic);
      } catch (error) {
        showToast.error('Error fetching clinic details');
        setError('Failed to fetch clinic details');
      } finally {
        setLoading(false);
      }
    };

    fetchClinic();
  }, [clinicId]);

  // Function to geocode address using Google Geocoding API
  const geocodeAddress = async (address: string): Promise<{ lat: number, lng: number } | null> => {
    try {
      if (typeof window === 'undefined' || !window.google) {
        return null;
      }

      const geocoder = new window.google.maps.Geocoder();

      return new Promise((resolve) => {
        geocoder.geocode({ address }, (results: any, status: string) => {
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
      return null;
    }
  };

  // Effect to geocode clinic address
  useEffect(() => {
    const geocodeClinicAddress = async () => {
      if (!clinic?.clinic_address || typeof window === 'undefined' || !window.google) {
        return;
      }

      // Only geocode if we don't already have the location
      if (clinicLocation) return;

      const cleanAddress = clinic.clinic_address.trim();

      // Skip geocoding for invalid addresses
      if (!cleanAddress || cleanAddress === 'Address not available' || /^[,\s]+$/.test(cleanAddress)) {
        return;
      }

      const coordinates = await geocodeAddress(cleanAddress);
      if (coordinates) {
        setClinicLocation(coordinates);
      }
    };

    const timer = setTimeout(geocodeClinicAddress, 1000);
    return () => clearTimeout(timer);
  }, [clinic?.clinic_address, clinicLocation]);

  const mapCenter = clinicLocation || defaultCenter;

  if (loading) {
    return <ClinicDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error loading clinic: {error}</div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-body-color">Clinic not found</div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen bg-gray-50 pt-[120px]">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section with Photos & Videos */}
        <Header clinic={clinic} user={user} />

        {/* Services & Pricing Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-8">
          <ServicesPricing clinic={clinic} />
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-8">
          <About clinic={clinic} />
        </div>

        {/* Location Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-8">
          <Location
            clinic={clinic}
            mapCenter={mapCenter}
            showInfoWindow={showInfoWindow}
            setShowInfoWindow={setShowInfoWindow}
          />
        </div>

        {/* Practitioners Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-8">
          <Practitioners clinic={clinic} />
        </div>
      </div>
    </div>
  );
};

export default ClinicDetailsPage;
