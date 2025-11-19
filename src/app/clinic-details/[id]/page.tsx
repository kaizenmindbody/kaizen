"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
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
  // Practitioner info
  practitioner?: {
    full_name: string;
    avatar: string;
    specialty: string[];
  };
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

        // Fetch practitioner info
        const { data: practitionerData } = await supabase
          .from('Users')
          .select('id, full_name, firstname, lastname, avatar, specialty')
          .eq('id', clinicData.practitioner_id)
          .single();

        let practitionerInfo = null;
        if (practitionerData) {
          // Compute full_name
          const fullName = practitionerData.firstname && practitionerData.lastname
            ? `${practitionerData.firstname} ${practitionerData.lastname}`.trim()
            : practitionerData.firstname || practitionerData.lastname || practitionerData.full_name || '';

          // Parse specialty
          let specialty = [];
          if (practitionerData.specialty) {
            if (typeof practitionerData.specialty === 'string') {
              try {
                specialty = JSON.parse(practitionerData.specialty);
              } catch {
                specialty = [practitionerData.specialty];
              }
            } else if (Array.isArray(practitionerData.specialty)) {
              specialty = practitionerData.specialty;
            }
          }

          practitionerInfo = {
            id: practitionerData.id,
            full_name: fullName,
            avatar: practitionerData.avatar || 'https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg',
            specialty: specialty
          };
        }

        const transformedClinic: ClinicData = {
          ...clinicData,
          clinic_images: parsedImages,
          practitioner: practitionerInfo
        };

        setClinic(transformedClinic);
      } catch (error) {
        console.error('Error fetching clinic:', error);
        toast.error('Error fetching clinic details');
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
