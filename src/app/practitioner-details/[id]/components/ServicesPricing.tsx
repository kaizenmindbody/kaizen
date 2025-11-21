"use client";

import { CheckCircle, Clock, Building2, Video, Package, DollarSign } from 'lucide-react';
import { useServicePricing } from '@/hooks/useServicePricing';

interface ServicesPricingProps {
  practitioner: any;
  descriptionsData?: any;
}

// Helper function to ensure price has $ prefix
const formatPriceDisplay = (price: string | undefined | null): string => {
  if (!price || price.trim() === '') return '';

  const trimmed = price.trim();

  // If already has $, return as is
  if (trimmed.startsWith('$')) return trimmed;

  // Handle ranges (e.g., "85 - 100")
  if (trimmed.includes('-')) {
    const parts = trimmed.split('-').map(p => p.trim());
    return parts.map(p => p ? `$${p}` : '').join(' - ');
  }

  // Single price - add $
  return `$${trimmed}`;
};

export const ServicesPricing = ({ practitioner, descriptionsData }: ServicesPricingProps) => {
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
              <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-4 md:p-6 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  In-Person / Clinic Visit
                </h4>

                {/* Table for Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Service</th>
                        <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">First Visit</th>
                        <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Return Visit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicePricings
                        .filter(sp => sp.service_category === 'In-Person / Clinic Visit')
                        .map((service, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                            <td className="py-3 px-2">
                              <div className="font-medium text-gray-900">{service.service_name}</div>
                              {service.is_sliding_scale && service.sliding_scale_info && (
                                <span className="text-xs text-blue-600">Sliding scale available</span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <div className="font-semibold text-gray-900">{formatPriceDisplay(service.first_time_price)}</div>
                              {service.first_time_duration && (
                                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {service.first_time_duration} min
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <div className="font-semibold text-gray-900">{formatPriceDisplay(service.returning_price)}</div>
                              {service.returning_duration && (
                                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {service.returning_duration} min
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* List for Mobile */}
                <div className="md:hidden space-y-3">
                  {servicePricings
                    .filter(sp => sp.service_category === 'In-Person / Clinic Visit')
                    .map((service, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="font-medium text-gray-900 mb-2">{service.service_name}</div>
                        {service.is_sliding_scale && service.sliding_scale_info && (
                          <p className="text-xs text-blue-600 mb-2">Sliding scale available</p>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">First Visit</div>
                            <div className="font-semibold text-gray-900">{formatPriceDisplay(service.first_time_price)}</div>
                            {service.first_time_duration && (
                              <div className="text-xs text-gray-500">{service.first_time_duration} min</div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Return Visit</div>
                            <div className="font-semibold text-gray-900">{formatPriceDisplay(service.returning_price)}</div>
                            {service.returning_duration && (
                              <div className="text-xs text-gray-500">{service.returning_duration} min</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Virtual Visit Services */}
            {servicePricings.filter(sp => sp.service_category === 'Virtual Visit').length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-4 md:p-6 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                  Virtual Visit
                </h4>

                {/* Table for Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Service</th>
                        <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">First Visit</th>
                        <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Return Visit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicePricings
                        .filter(sp => sp.service_category === 'Virtual Visit')
                        .map((service, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-purple-50/30 transition-colors">
                            <td className="py-3 px-2">
                              <div className="font-medium text-gray-900">{service.service_name}</div>
                              {service.is_sliding_scale && service.sliding_scale_info && (
                                <span className="text-xs text-purple-600">Sliding scale available</span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <div className="font-semibold text-gray-900">{formatPriceDisplay(service.first_time_price)}</div>
                              {service.first_time_duration && (
                                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {service.first_time_duration} min
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <div className="font-semibold text-gray-900">{formatPriceDisplay(service.returning_price)}</div>
                              {service.returning_duration && (
                                <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {service.returning_duration} min
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* List for Mobile */}
                <div className="md:hidden space-y-3">
                  {servicePricings
                    .filter(sp => sp.service_category === 'Virtual Visit')
                    .map((service, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="font-medium text-gray-900 mb-2">{service.service_name}</div>
                        {service.is_sliding_scale && service.sliding_scale_info && (
                          <p className="text-xs text-purple-600 mb-2">Sliding scale available</p>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">First Visit</div>
                            <div className="font-semibold text-gray-900">{formatPriceDisplay(service.first_time_price)}</div>
                            {service.first_time_duration && (
                              <div className="text-xs text-gray-500">{service.first_time_duration} min</div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Return Visit</div>
                            <div className="font-semibold text-gray-900">{formatPriceDisplay(service.returning_price)}</div>
                            {service.returning_duration && (
                              <div className="text-xs text-gray-500">{service.returning_duration} min</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Packages */}
            {packagePricings.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-4 md:p-6 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  Packages
                </h4>

                {/* Table for Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Package</th>
                        <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Sessions</th>
                        <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packagePricings.map((pkg, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-green-50/30 transition-colors">
                          <td className="py-3 px-2">
                            <div className="font-medium text-gray-900">{pkg.service_name}</div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <div className="text-gray-700">{pkg.no_of_sessions} sessions</div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <div className="font-semibold text-gray-900">{formatPriceDisplay(pkg.price)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* List for Mobile */}
                <div className="md:hidden space-y-3">
                  {packagePricings.map((pkg, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="font-medium text-gray-900 mb-2">{pkg.service_name}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">{pkg.no_of_sessions} sessions</div>
                        <div className="font-semibold text-gray-900">{formatPriceDisplay(pkg.price)}</div>
                      </div>
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
                {descriptionsData?.insurance || 'We currently do not directly bill insurance. If you would like to submit a receipt to your insurance company, we can generate an invoice for you.'}
              </p>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Cancellation Policy</h4>
              <div className="text-sm md:text-base text-gray-700 leading-relaxed">
                {descriptionsData?.cancellation ? (
                  <p>{descriptionsData.cancellation}</p>
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
