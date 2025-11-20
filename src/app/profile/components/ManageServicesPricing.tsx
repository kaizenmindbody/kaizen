"use client";

import { ProfileData } from '@/types/user';
import { useState, useEffect, useMemo } from 'react';
import { useService } from '@/hooks/useService';
import { useServicePricing, type UseServicePricingReturn } from '@/hooks/useServicePricing';
import { ServicePricing, PackagePricing } from '@/store/slices/servicePricingSlice';

interface ManageServicesPricingProps {
  profile: ProfileData | null;
}

// Helper function to auto-format price with $ prefix
const formatPrice = (value: string): string => {
  if (!value || value.trim() === '') return '';

  // Remove all $ signs first
  let cleaned = value.replace(/\$/g, '').trim();

  // Check if it's a range (contains -)
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-').map(p => p.trim());
    // Add $ to each part
    return parts.map(p => p ? `$${p}` : '').join(' - ');
  }

  // Single price - just add $
  return cleaned ? `$${cleaned}` : '';
};

const ManageServicesPricing: React.FC<ManageServicesPricingProps> = ({ profile }) => {
  const { services: availableServices, loading: servicesLoading } = useService();

  // Use the service pricing hook
  const {
    servicePricings: storePricings,
    packagePricings: storePackagePricings,
    loading,
    saving,
    error,
    successMessage,
    fetchServicePricing,
    saveServicePricing,
    updateServicePricings,
    updatePackagePricings,
    clearError,
    clearSuccessMessage,
  } = useServicePricing(profile?.id);

  // Filter services to only show real visit types for In-Person / Clinic Visit
  const realServices = useMemo(() => {
    return availableServices.filter(service => service.type === 'real');
  }, [availableServices]);

  // Filter services to only show virtual visit types for Virtual Visit
  const virtualServices = useMemo(() => {
    return availableServices.filter(service => service.type === 'virtual');
  }, [availableServices]);

  // Local state for editing
  const [servicePricings, setServicePricings] = useState<ServicePricing[]>([
    {
      service_name: '',
      first_time_price: '',
      first_time_duration: '',
      returning_price: '',
      returning_duration: '',
      is_sliding_scale: false,
      sliding_scale_info: '',
      service_category: 'In-Person / Clinic Visit',
    },
  ]);

  const [virtualPricings, setVirtualPricings] = useState<ServicePricing[]>([
    {
      service_name: '',
      first_time_price: '',
      first_time_duration: '',
      returning_price: '',
      returning_duration: '',
      is_sliding_scale: false,
      sliding_scale_info: '',
      service_category: 'Virtual Visit',
    },
  ]);

  const [packagePricings, setPackagePricings] = useState<PackagePricing[]>([
    {
      service_name: '',
      no_of_sessions: '',
      price: '',
      service_category: 'Packages',
    },
  ]);

  // Sync local state with store data when loaded
  useEffect(() => {
    if (storePricings.length > 0) {
      const inPersonServices = storePricings.filter(sp => sp.service_category === 'In-Person / Clinic Visit');
      const virtualServicesList = storePricings.filter(sp => sp.service_category === 'Virtual Visit');

      if (inPersonServices.length > 0) {
        setServicePricings(inPersonServices);
      }

      if (virtualServicesList.length > 0) {
        setVirtualPricings(virtualServicesList);
      }
    }

    if (storePackagePricings.length > 0) {
      setPackagePricings(storePackagePricings);
    }
  }, [storePricings, storePackagePricings]);

  const handleAddService = (category: 'In-Person / Clinic Visit' | 'Virtual Visit') => {
    const newService = {
      service_name: '',
      first_time_price: '',
      first_time_duration: '',
      returning_price: '',
      returning_duration: '',
      is_sliding_scale: false,
      sliding_scale_info: '',
      service_category: category,
    };

    if (category === 'In-Person / Clinic Visit') {
      setServicePricings([...servicePricings, newService]);
    } else {
      setVirtualPricings([...virtualPricings, newService]);
    }
  };

  const handleAddPackage = () => {
    const newPackage = {
      service_name: '',
      no_of_sessions: '',
      price: '',
      service_category: 'Packages',
    };
    setPackagePricings([...packagePricings, newPackage]);
  };

  const handleRemoveService = (index: number, category: 'In-Person / Clinic Visit' | 'Virtual Visit') => {
    if (category === 'In-Person / Clinic Visit') {
      if (servicePricings.length === 1) {
        // Don't allow removing the last service
        return;
      }
      setServicePricings(servicePricings.filter((_, i) => i !== index));
    } else {
      if (virtualPricings.length === 1) {
        // Don't allow removing the last service
        return;
      }
      setVirtualPricings(virtualPricings.filter((_, i) => i !== index));
    }
  };

  const handleRemovePackage = (index: number) => {
    if (packagePricings.length === 1) {
      // Don't allow removing the last package
      return;
    }
    setPackagePricings(packagePricings.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: keyof ServicePricing, value: any, category: 'In-Person / Clinic Visit' | 'Virtual Visit') => {
    const serviceList = category === 'In-Person / Clinic Visit' ? realServices : virtualServices;
    const pricingList = category === 'In-Person / Clinic Visit' ? servicePricings : virtualPricings;
    const setPricingList = category === 'In-Person / Clinic Visit' ? setServicePricings : setVirtualPricings;

    const updated = [...pricingList];

    // If service name is changed, find and set the service_id
    if (field === 'service_name') {
      const selectedService = serviceList.find(s => s.title === value);
      updated[index] = {
        ...updated[index],
        [field]: value,
        service_id: selectedService?.id
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    setPricingList(updated);
  };

  // Handler to auto-format price on blur
  const handlePriceBlur = (index: number, field: 'first_time_price' | 'returning_price', category: 'In-Person / Clinic Visit' | 'Virtual Visit') => {
    const pricingList = category === 'In-Person / Clinic Visit' ? servicePricings : virtualPricings;
    const setPricingList = category === 'In-Person / Clinic Visit' ? setServicePricings : setVirtualPricings;

    const updated = [...pricingList];
    const currentValue = updated[index][field];

    if (currentValue) {
      updated[index] = { ...updated[index], [field]: formatPrice(currentValue) };
      setPricingList(updated);
    }
  };

  const handlePackageChange = (index: number, field: keyof PackagePricing, value: any) => {
    const updated = [...packagePricings];

    // If service name is changed, find and set the service_id
    if (field === 'service_name') {
      const selectedService = realServices.find(s => s.title === value);
      updated[index] = {
        ...updated[index],
        [field]: value,
        service_id: selectedService?.id
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    setPackagePricings(updated);
  };

  // Handler to auto-format package price on blur
  const handlePackagePriceBlur = (index: number) => {
    const updated = [...packagePricings];
    const currentValue = updated[index].price;

    if (currentValue) {
      updated[index] = { ...updated[index], price: formatPrice(currentValue) };
      setPackagePricings(updated);
    }
  };

  const handleSave = async () => {
    if (!profile?.id) {
      return;
    }

    // Validate required fields
    const hasEmptyInPersonService = servicePricings.some(sp => !sp.service_name);
    const hasEmptyVirtualService = virtualPricings.some(sp => !sp.service_name);
    const hasEmptyPackage = packagePricings.some(pkg => !pkg.service_name);

    if (hasEmptyInPersonService || hasEmptyVirtualService || hasEmptyPackage) {
      return;
    }

    const success = await saveServicePricing(
      profile.id,
      [...servicePricings, ...virtualPricings],
      packagePricings
    );

    if (success) {
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Services and Pricing</h2>
        <p className="text-gray-600">Configure your services and set pricing for each specialty.</p>
      </div>

      {/* Success/Error Message */}
      {successMessage && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Services and Pricing Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Services and Pricing*</h3>

          {/* Sliding Scale Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sliding Scale? For sliding scale, enter the price range into the Pricing field (e.g., 85 - 100). The $ sign will be added automatically.
            </label>
            <select
              value={servicePricings[0]?.is_sliding_scale ? 'yes' : 'no'}
              onChange={(e) => {
                const isSliding = e.target.value === 'yes';
                setServicePricings(servicePricings.map(sp => ({ ...sp, is_sliding_scale: isSliding })));
              }}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>

        {/* In-Person / Clinic Visit Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">In-Person / Clinic Visit</h3>

          <div className="space-y-4">
            {servicePricings.map((pricing, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  {/* Service Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service(s)
                    </label>
                    <select
                      value={pricing.service_name}
                      onChange={(e) => handleServiceChange(index, 'service_name', e.target.value, 'In-Person / Clinic Visit')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select a service</option>
                      {realServices.map((service) => (
                        <option key={service.id} value={service.title}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* First Time Patient - Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Time Patient - Price
                    </label>
                    <input
                      type="text"
                      value={pricing.first_time_price}
                      onChange={(e) => handleServiceChange(index, 'first_time_price', e.target.value, 'In-Person / Clinic Visit')}
                      onBlur={() => handlePriceBlur(index, 'first_time_price', 'In-Person / Clinic Visit')}
                      placeholder={pricing.is_sliding_scale ? "85 - 100" : "85"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* First Time Patient - Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (in minutes)
                    </label>
                    <input
                      type="number"
                      value={pricing.first_time_duration}
                      onChange={(e) => handleServiceChange(index, 'first_time_duration', e.target.value, 'In-Person / Clinic Visit')}
                      placeholder="60"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Returning Patient - Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Returning Patient - Price
                    </label>
                    <input
                      type="text"
                      value={pricing.returning_price}
                      onChange={(e) => handleServiceChange(index, 'returning_price', e.target.value, 'In-Person / Clinic Visit')}
                      onBlur={() => handlePriceBlur(index, 'returning_price', 'In-Person / Clinic Visit')}
                      placeholder={pricing.is_sliding_scale ? "75 - 90" : "75"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Returning Patient - Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (in minutes)
                    </label>
                    <input
                      type="number"
                      value={pricing.returning_duration}
                      onChange={(e) => handleServiceChange(index, 'returning_duration', e.target.value, 'In-Person / Clinic Visit')}
                      placeholder="45"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index, 'In-Person / Clinic Visit')}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove Service
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Service Button */}
          <button
            type="button"
            onClick={() => handleAddService('In-Person / Clinic Visit')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add New Service
          </button>
        </div>

        {/* Virtual Visit Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Virtual Visit</h3>

          <div className="space-y-4">
            {virtualPricings.map((pricing, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  {/* Service Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service(s)
                    </label>
                    <select
                      value={pricing.service_name}
                      onChange={(e) => handleServiceChange(index, 'service_name', e.target.value, 'Virtual Visit')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select a service</option>
                      {virtualServices.map((service) => (
                        <option key={service.id} value={service.title}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* First Time Patient - Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Time Patient - Price
                    </label>
                    <input
                      type="text"
                      value={pricing.first_time_price}
                      onChange={(e) => handleServiceChange(index, 'first_time_price', e.target.value, 'Virtual Visit')}
                      onBlur={() => handlePriceBlur(index, 'first_time_price', 'Virtual Visit')}
                      placeholder={pricing.is_sliding_scale ? "85 - 100" : "85"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* First Time Patient - Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (in minutes)
                    </label>
                    <input
                      type="number"
                      value={pricing.first_time_duration}
                      onChange={(e) => handleServiceChange(index, 'first_time_duration', e.target.value, 'Virtual Visit')}
                      placeholder="60"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Returning Patient - Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Returning Patient - Price
                    </label>
                    <input
                      type="text"
                      value={pricing.returning_price}
                      onChange={(e) => handleServiceChange(index, 'returning_price', e.target.value, 'Virtual Visit')}
                      onBlur={() => handlePriceBlur(index, 'returning_price', 'Virtual Visit')}
                      placeholder={pricing.is_sliding_scale ? "75 - 90" : "75"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Returning Patient - Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (in minutes)
                    </label>
                    <input
                      type="number"
                      value={pricing.returning_duration}
                      onChange={(e) => handleServiceChange(index, 'returning_duration', e.target.value, 'Virtual Visit')}
                      placeholder="45"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index, 'Virtual Visit')}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove Service
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Virtual Service Button */}
          <button
            type="button"
            onClick={() => handleAddService('Virtual Visit')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add New Service
          </button>
        </div>

        {/* Packages Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Packages</h3>

          <div className="space-y-4">
            {packagePricings.map((packagePricing, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  {/* Service Dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service(s)
                    </label>
                    <select
                      value={packagePricing.service_name}
                      onChange={(e) => handlePackageChange(index, 'service_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select a service</option>
                      {realServices.map((service) => (
                        <option key={service.id} value={service.title}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* No. of Sessions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No. of Sessions
                    </label>
                    <input
                      type="number"
                      value={packagePricing.no_of_sessions}
                      onChange={(e) => handlePackageChange(index, 'no_of_sessions', e.target.value)}
                      placeholder="e.g., 5, 10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <input
                      type="text"
                      value={packagePricing.price}
                      onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                      onBlur={() => handlePackagePriceBlur(index)}
                      placeholder="400"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemovePackage(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove Package
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Package Button */}
          <button
            type="button"
            onClick={handleAddPackage}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add New Package
          </button>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Pricing Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Enter prices without the $ sign (e.g., 85 or 85 - 100) - it will be added automatically</li>
            <li>• Set competitive rates based on your experience and specialty</li>
            <li>• Consider offering package deals for multiple sessions</li>
            <li>• Review and adjust pricing quarterly based on demand</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
          <button
            type="button"
            onClick={() => profile?.id && fetchServicePricing(profile.id)}
            disabled={saving || loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || servicesLoading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageServicesPricing;
