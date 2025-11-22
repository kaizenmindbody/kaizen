"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ServicesPricingProps {
  clinic: any;
}

interface ServicePricing {
  id: string;
  service_name: string;
  service_category: string;
  first_time_price: string;
  first_time_duration: string;
  returning_price: string;
  returning_duration: string;
  is_sliding_scale: boolean;
}

interface PackagePricing {
  id: string;
  service_name: string;
  no_of_sessions: string;
  price: string;
}

export const ServicesPricing = ({ clinic }: ServicesPricingProps) => {
  const [servicePricings, setServicePricings] = useState<ServicePricing[]>([]);
  const [packagePricings, setPackagePricings] = useState<PackagePricing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      if (!clinic.practitioner_id) return;

      try {
        // Fetch service pricing from API
        const response = await fetch(`/api/service-pricing?practitionerId=${clinic.practitioner_id}&isClinicSpecific=true`);
        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (data.servicePricing) {
          const services = data.servicePricing.filter((sp: any) => sp.service_category !== 'Packages');
          const packages = data.servicePricing.filter((sp: any) => sp.service_category === 'Packages');

          setServicePricings(services);
          setPackagePricings(packages);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [clinic.practitioner_id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (servicePricings.length === 0 && packagePricings.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Pricing Information Coming Soon</h3>
        <p className="text-gray-600">
          Please contact the clinic directly for pricing details and service information.
        </p>
      </div>
    );
  }

  // Get all unique service names for the right sidebar
  const allServiceNames = [...new Set(servicePricings.map(s => s.service_name))];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#35375F' }}>
        Services & Pricing
      </h2>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Pricing Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* In-Person Services */}
          {servicePricings.filter(s => s.service_category === 'In-Person / Clinic Visit').length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                In-Person / Clinic Visit
              </h3>
              <div className="grid gap-6">
                {servicePricings
                  .filter(s => s.service_category === 'In-Person / Clinic Visit')
                  .map((service) => (
                    <div key={service.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">{service.service_name}</h4>

                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm text-gray-600">First Time Patient</span>
                            <span className="text-xl font-bold text-gray-900">{service.first_time_price}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.first_time_duration} minutes
                          </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm text-gray-600">Returning Patient</span>
                            <span className="text-xl font-bold text-gray-900">{service.returning_price}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.returning_duration} minutes
                          </div>
                        </div>

                        {service.is_sliding_scale && (
                          <div className="flex items-center text-sm text-primary font-medium">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Sliding scale available
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Virtual Services */}
          {servicePricings.filter(s => s.service_category === 'Virtual Visit').length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Virtual Visit
              </h3>
              <div className="grid gap-6">
                {servicePricings
                  .filter(s => s.service_category === 'Virtual Visit')
                  .map((service) => (
                    <div key={service.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">{service.service_name}</h4>

                      <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm text-gray-600">First Time Patient</span>
                            <span className="text-xl font-bold text-gray-900">{service.first_time_price}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.first_time_duration} minutes
                          </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm text-gray-600">Returning Patient</span>
                            <span className="text-xl font-bold text-gray-900">{service.returning_price}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.returning_duration} minutes
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Package Pricing */}
          {packagePricings.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <svg className="w-6 h-6 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Package Deals
              </h3>
              <div className="grid gap-6">
                {packagePricings.map((pkg) => (
                  <div key={pkg.id} className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 rounded-xl p-6 hover:shadow-lg transition-all">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">{pkg.service_name}</h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">Sessions</span>
                        <span className="text-2xl font-bold text-black">{pkg.no_of_sessions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Price</span>
                        <span className="text-xl font-bold text-gray-900">{pkg.price}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-amber-200">
                      <p className="text-sm text-gray-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Save with package pricing
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Services List & Specialties */}
        <div className="lg:col-span-1 space-y-6">
          {/* Services List */}
          {allServiceNames.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-xl p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Our Services
              </h3>
              <ul className="space-y-3">
                {allServiceNames.map((serviceName, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{serviceName}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specialties */}
          {clinic.practitioner?.specialty && clinic.practitioner.specialty.length > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {clinic.practitioner.specialty.map((spec: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1.5 bg-white border-2 border-green-200 text-green-700 rounded-full text-sm font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info Card */}
          {/* <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Contact us to learn more about our services or to schedule an appointment.
            </p>
            {clinic.clinic_phone && (
              <a
                href={`tel:${clinic.clinic_phone}`}
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Now
              </a>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};
