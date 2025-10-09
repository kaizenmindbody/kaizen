"use client";

import { CheckCircle, DollarSign, Clock } from 'lucide-react';
import { useServicePricing } from '@/hooks/useServicePricing';

interface ServicesPricingProps {
  practitioner: any;
}

export const ServicesPricing = ({ practitioner }: ServicesPricingProps) => {
  const { servicePricings, packagePricings, loading } = useServicePricing(practitioner?.id);
  return (
    <div>
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-orange-500 mb-4 md:mb-6">Services & Pricing</h3>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Side - Services and Pricing */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* In-Person Services */}
            {servicePricings.filter(sp => sp.service_category === 'In-Person / Clinic Visit').length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  In-Person / Clinic Visit
                </h4>
                <div className="space-y-4">
                  {servicePricings
                    .filter(sp => sp.service_category === 'In-Person / Clinic Visit')
                    .map((service, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
                        <div className="mb-4">
                          <h5 className="text-lg font-semibold text-gray-900">{service.service_name}</h5>
                          {service.is_sliding_scale && service.sliding_scale_info && (
                            <p className="text-sm text-blue-600 mt-1">Sliding scale available</p>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">First Time Patient</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-gray-900">{service.first_time_price}</span>
                              {service.first_time_duration && (
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {service.first_time_duration} min
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">Returning Patient</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-gray-900">{service.returning_price}</span>
                              {service.returning_duration && (
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {service.returning_duration} min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Virtual Visit Services */}
            {servicePricings.filter(sp => sp.service_category === 'Virtual Visit').length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  Virtual Visit
                </h4>
                <div className="space-y-4">
                  {servicePricings
                    .filter(sp => sp.service_category === 'Virtual Visit')
                    .map((service, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
                        <div className="mb-4">
                          <h5 className="text-lg font-semibold text-gray-900">{service.service_name}</h5>
                          {service.is_sliding_scale && service.sliding_scale_info && (
                            <p className="text-sm text-purple-600 mt-1">Sliding scale available</p>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">First Time Patient</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-gray-900">{service.first_time_price}</span>
                              {service.first_time_duration && (
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {service.first_time_duration} min
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">Returning Patient</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-gray-900">{service.returning_price}</span>
                              {service.returning_duration && (
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {service.returning_duration} min
                                </span>
                              )}
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
              <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  Packages
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packagePricings.map((pkg, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">{pkg.service_name}</h5>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-gray-900">{pkg.price}</span>
                      </div>
                      <p className="text-sm text-gray-600">{pkg.no_of_sessions} sessions</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No pricing data available */}
            {servicePricings.length === 0 && packagePricings.length === 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-12 md:p-16 shadow-sm">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <DollarSign className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-700 mb-3">Pricing Not Available</h4>
                  <p className="text-base text-gray-500 leading-relaxed">
                    This practitioner has not provided pricing information yet. Please contact them directly for rates and availability.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Insurance and Cancellation Policy */}
          <div className="lg:col-span-1 space-y-6">
            {/* Insurance Information */}
            <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-500" />
                Insurance
              </h4>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                We currently do not directly bill insurance. If you would like to submit a receipt to your insurance company, we can generate an invoice for you.
              </p>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Cancellation Policy</h4>
              <div className="text-sm md:text-base text-gray-700 leading-relaxed">
                {practitioner?.cancellation_policy ? (
                  <p>{practitioner.cancellation_policy}</p>
                ) : (
                  <div className="space-y-2">
                    <p>Please provide 24 hours notice for cancellations.</p>
                    <p>Late cancellations or no-shows may be subject to a fee.</p>
                    <p>Contact us as soon as possible if you need to reschedule.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
