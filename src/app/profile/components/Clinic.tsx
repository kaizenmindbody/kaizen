"use client";

import { ProfileData } from '@/types/user';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useServicePricing } from '@/hooks/useServicePricing';
import Image from 'next/image';
import { Building2, Globe, Phone, Mail, MapPin, ImageIcon, Film } from 'lucide-react';

interface ClinicProps {
  profile: ProfileData | null;
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
  clinic_images: string[] | null;
  created_at: string;
  updated_at: string;
}

const Clinic: React.FC<ClinicProps> = ({ profile }) => {
  const [clinicData, setClinicData] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch clinic-specific pricing
  const {
    servicePricings,
    packagePricings,
  } = useServicePricing(profile?.id, true); // true = clinic-specific pricing

  // Format phone number
  const formatPhoneNumber = (phone: string | null | undefined) => {
    if (!phone) return 'N/A';

    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned.charAt(0)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
  };

  // Fetch clinic data
  useEffect(() => {
    const fetchClinicData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('Clinics')
          .select('*')
          .eq('practitioner_id', profile.id)
          .single();

        if (error) {
          console.error('Error fetching clinic data:', error);
          setClinicData(null);
        } else {
          // Parse clinic_images if it's a JSON string
          if (data) {
            const parsedData = {
              ...data,
              clinic_images: data.clinic_images
                ? (typeof data.clinic_images === 'string'
                    ? JSON.parse(data.clinic_images)
                    : Array.isArray(data.clinic_images)
                      ? data.clinic_images
                      : [])
                : null
            };
            setClinicData(parsedData);
          } else {
            setClinicData(null);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setClinicData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!clinicData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">View Clinic Profile</h2>
          <p className="text-gray-600">View your clinic information as it appears to patients.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <Building2 className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Clinic Profile Found</h3>
          <p className="text-gray-600">
            You haven&apos;t created a clinic profile yet. Go to &quot;Update Clinic Profile&quot; to create one.
          </p>
        </div>
      </div>
    );
  }

  const formattedAddress = clinicData.clinic_address
    ? clinicData.clinic_address.split(',').map(p => p.trim()).filter(p => p).join(', ')
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">View Clinic Profile</h2>
        <p className="text-gray-600">View your clinic information as it appears to patients.</p>
      </div>

      {/* Clinic Header with Logo */}
      <div className="bg-gradient-to-br from-primary/5 via-white to-blue-50 border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Clinic Logo */}
          <div className="relative">
            <div className="w-40 h-40 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-lg border-4 border-white ring-2 ring-primary/20">
              {clinicData.clinic_logo ? (
                <Image
                  src={clinicData.clinic_logo}
                  alt={clinicData.clinic_name}
                  width={160}
                  height={160}
                  sizes="160px"
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Building2 className="w-20 h-20 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Clinic Name and Info */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-4xl font-bold text-gray-900 mb-2">
              {clinicData.clinic_name}
            </h3>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <span className="inline-flex items-center px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <Building2 className="w-4 h-4 mr-2" />
                Clinic
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clinicData.clinic_email && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Email</h4>
                <p className="text-gray-900">{clinicData.clinic_email}</p>
              </div>
            </div>
          )}

          {clinicData.clinic_phone && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Phone</h4>
                <p className="text-gray-900">{formatPhoneNumber(clinicData.clinic_phone)}</p>
              </div>
            </div>
          )}

          {clinicData.clinic_website && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
              <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Website</h4>
                <a
                  href={clinicData.clinic_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {clinicData.clinic_website}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      {formattedAddress && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Location</h3>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-900">{formattedAddress}</p>
            </div>
          </div>
        </div>
      )}

      {/* Services and Pricing */}
      {servicePricings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Services & Pricing</h3>
          </div>

          {/* In-Person Services */}
          {servicePricings.filter(s => s.service_category === 'In-Person / Clinic Visit').length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                In-Person / Clinic Visit
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicePricings
                  .filter(s => s.service_category === 'In-Person / Clinic Visit')
                  .map((service, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all">
                      <h5 className="font-bold text-gray-900 mb-4 text-lg">{service.service_name}</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">First Time Patient</p>
                            <p className="text-gray-900 font-bold text-lg">{service.first_time_price}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                            <p className="text-gray-900 font-semibold">{service.first_time_duration} min</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Returning Patient</p>
                            <p className="text-gray-900 font-bold text-lg">{service.returning_price}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                            <p className="text-gray-900 font-semibold">{service.returning_duration} min</p>
                          </div>
                        </div>
                      </div>
                      {service.is_sliding_scale && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Sliding scale available
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Virtual Services */}
          {servicePricings.filter(s => s.service_category === 'Virtual Visit').length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Virtual Visit
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicePricings
                  .filter(s => s.service_category === 'Virtual Visit')
                  .map((service, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-purple-50/30 hover:shadow-md transition-all">
                      <h5 className="font-bold text-gray-900 mb-4 text-lg">{service.service_name}</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">First Time Patient</p>
                            <p className="text-gray-900 font-bold text-lg">{service.first_time_price}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                            <p className="text-gray-900 font-semibold">{service.first_time_duration} min</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Returning Patient</p>
                            <p className="text-gray-900 font-bold text-lg">{service.returning_price}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                            <p className="text-gray-900 font-semibold">{service.returning_duration} min</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Packages */}
          {packagePricings.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Packages
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {packagePricings.map((pkg, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-amber-50/30 hover:shadow-md transition-all">
                    <h5 className="font-bold text-gray-900 mb-3 text-lg">{pkg.service_name}</h5>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Sessions</p>
                        <p className="text-gray-900 font-bold text-lg">{pkg.no_of_sessions}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Total</p>
                        <p className="text-gray-900 font-bold text-lg">{pkg.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clinic Video */}
      {clinicData.clinic_video && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Clinic Video</h3>
          </div>
          <div className="flex justify-center items-center">
            <video
              src={clinicData.clinic_video}
              controls
              className="w-full max-w-2xl rounded-xl shadow-lg bg-black"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Clinic Images Gallery */}
      {clinicData.clinic_images && clinicData.clinic_images.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Clinic Gallery</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {clinicData.clinic_images.map((imageUrl, index) => (
              <div key={index} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all cursor-pointer">
                <Image
                  src={imageUrl}
                  alt={`Clinic image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Clinic;
