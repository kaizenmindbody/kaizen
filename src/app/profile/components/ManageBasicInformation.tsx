"use client";

import { ProfileData } from '@/types/user';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useDegrees } from '@/hooks/useDegrees';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import 'react-phone-input-2/lib/style.css';

const PhoneInput = dynamic(() => import('react-phone-input-2'), {
  ssr: false,
  loading: () => <div className="w-full h-12 bg-gray-100 animate-pulse rounded-lg"></div>
});

interface ManageBasicInformationProps {
  profile: ProfileData | null;
}

const ManageBasicInformation: React.FC<ManageBasicInformationProps> = ({ profile }) => {
  const { user, refreshProfile } = useAuth();
  const { degrees } = useDegrees();

  // Parse address from database format "line1, line2, city, state, zip"
  const parseAddress = (address: string | undefined) => {
    if (!address) {
      return { address_line1: '', address_line2: '', city: '', state: '', zip_code: '' };
    }

    const parts = address.split(',').map(p => p.trim());
    return {
      address_line1: parts[0] || '',
      address_line2: parts[1] || '',
      city: parts[2] || '',
      state: parts[3] || '',
      zip_code: parts[4] || '',
    };
  };

  const addressParts = parseAddress(profile?.address);

  const [formData, setFormData] = useState({
    first_name: profile?.firstname || '',
    last_name: profile?.lastname || '',
    title: profile?.title || '',
    degree: profile?.degree || '',
    type_of_practitioner: '',
    clinic_name: profile?.clinic || '',
    create_clinic_page: profile?.clinicpage || 'no',
    website: profile?.website || '',
    business_phone: profile?.phone || '',
    business_email: profile?.email || '',
    address_line1: addressParts.address_line1,
    address_line2: addressParts.address_line2,
    city: addressParts.city,
    state: addressParts.state,
    zip_code: addressParts.zip_code,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle address selection from Google Places
  const handleAddressSelect = async (address: string) => {
    try {
      const results = await geocodeByAddress(address);
      const latLng = await getLatLng(results[0]);

      // Parse address components
      const addressComponents = results[0].address_components;
      let streetNumber = '';
      let route = '';
      let city = '';
      let state = '';
      let zipCode = '';

      addressComponents.forEach(component => {
        const types = component.types;
        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        }
        if (types.includes('route')) {
          route = component.long_name;
        }
        if (types.includes('locality')) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
        if (types.includes('postal_code')) {
          zipCode = component.long_name;
        }
      });

      const addressLine1 = `${streetNumber} ${route}`.trim();

      setFormData(prev => ({
        ...prev,
        address_line1: addressLine1,
        city: city,
        state: state,
        zip_code: zipCode,
      }));
    } catch (error) {
      console.error('Error selecting address:', error);
      toast.error('Failed to parse address. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    // Validation
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    if (formData.website && !formData.website.startsWith('http')) {
      toast.error('Website must start with http:// or https://');
      return;
    }

    setIsSaving(true);

    try {
      // Construct full address from parts
      const addressParts = [
        formData.address_line1,
        formData.address_line2,
        formData.city,
        formData.state,
        formData.zip_code
      ].filter(part => part.trim()).join(', ');

      // Update user data in database
      const updateData = {
        firstname: formData.first_name.trim(),
        lastname: formData.last_name.trim(),
        title: formData.title.trim() || null,
        degree: formData.degree || null,
        clinic: formData.clinic_name.trim() || null,
        clinicpage: formData.create_clinic_page || null,
        website: formData.website.trim() || null,
        phone: formData.business_phone || null,
        address: addressParts || null,
      };

      console.log('Saving profile data:', updateData);

      const { error } = await supabase
        .from('Users')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Profile saved successfully');

      // Refresh profile data in AuthContext
      await refreshProfile();

      toast.success('Account updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update account. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original profile values
    if (profile) {
      const addressParts = parseAddress(profile.address);

      setFormData({
        first_name: profile.firstname || '',
        last_name: profile.lastname || '',
        title: profile.title || '',
        degree: profile.degree || '',
        type_of_practitioner: '',
        clinic_name: profile.clinic || '',
        create_clinic_page: profile.clinicpage || 'no',
        website: profile.website || '',
        business_phone: profile.phone || '',
        business_email: profile.email || '',
        address_line1: addressParts.address_line1,
        address_line2: addressParts.address_line2,
        city: addressParts.city,
        state: addressParts.state,
        zip_code: addressParts.zip_code,
      });
    }
  };

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      const addressParts = parseAddress(profile.address);

      setFormData({
        first_name: profile.firstname || '',
        last_name: profile.lastname || '',
        title: profile.title || '',
        degree: profile.degree || '',
        type_of_practitioner: '',
        clinic_name: profile.clinic || '',
        create_clinic_page: profile.clinicpage || 'no',
        website: profile.website || '',
        business_phone: profile.phone || '',
        business_email: profile.email || '',
        address_line1: addressParts.address_line1,
        address_line2: addressParts.address_line2,
        city: addressParts.city,
        state: addressParts.state,
        zip_code: addressParts.zip_code,
      });
    }
  }, [profile]);

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      padding: '0.125rem',
      minHeight: '42px',
      boxShadow: state.isFocused ? '0 0 0 2px #D4A574' : 'none',
      borderColor: state.isFocused ? '#D4A574' : '#d1d5db',
      '&:hover': {
        borderColor: '#D4A574',
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#D4A574' : state.isFocused ? '#fef3e2' : 'white',
      color: state.isSelected ? 'white' : '#374151',
    }),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Your Account</h2>
        <p className="text-gray-600">Update your account information and professional credentials.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your first name"
                disabled={isSaving}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter your last name"
                disabled={isSaving}
                required
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., Dr., Mr., Ms."
                disabled={isSaving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Degrees</label>
              <Select
                value={formData.degree ? { value: formData.degree, label: formData.degree } : null}
                onChange={(option) => handleInputChange('degree', option?.value || '')}
                options={degrees.map(degree => ({ value: degree.title, label: degree.title }))}
                styles={customSelectStyles}
                placeholder="Select your degree"
                isClearable
                isDisabled={isSaving}
              />
            </div>
          </div>

          {/* Practitioner Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type of Practitioner</label>
            <input
              type="text"
              value={formData.type_of_practitioner}
              onChange={(e) => handleInputChange('type_of_practitioner', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="e.g., Acupuncturist, Herbalist, Massage Therapist"
              disabled={isSaving}
            />
          </div>

          {/* Clinic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clinic Name <span className="text-gray-500 text-xs">(if applicable)</span>
            </label>
            <input
              type="text"
              value={formData.clinic_name}
              onChange={(e) => handleInputChange('clinic_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter clinic name"
              disabled={isSaving}
            />
          </div>

          {/* Clinic Page Option */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              If your clinic has more than one Practitioner, would you like to create a separate Clinic Page as well?
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="create_clinic_page"
                  value="yes"
                  checked={formData.create_clinic_page === 'yes'}
                  onChange={(e) => handleInputChange('create_clinic_page', e.target.value)}
                  disabled={isSaving}
                  className="w-4 h-4 text-primary focus:ring-primary focus:ring-2 disabled:cursor-not-allowed"
                />
                <span className="ml-2 text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="create_clinic_page"
                  value="no"
                  checked={formData.create_clinic_page === 'no'}
                  onChange={(e) => handleInputChange('create_clinic_page', e.target.value)}
                  disabled={isSaving}
                  className="w-4 h-4 text-primary focus:ring-primary focus:ring-2 disabled:cursor-not-allowed"
                />
                <span className="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="https://example.com"
              disabled={isSaving}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
              <PhoneInput
                country={'us'}
                value={formData.business_phone}
                onChange={(value) => handleInputChange('business_phone', value)}
                disabled={isSaving}
                inputProps={{
                  name: 'business_phone',
                  disabled: isSaving,
                }}
                containerClass="w-full"
                inputClass="w-full"
                inputStyle={{
                  width: '100%',
                  height: '42px',
                  paddingLeft: '48px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: isSaving ? '#f3f4f6' : 'white',
                  cursor: isSaving ? 'not-allowed' : 'text',
                }}
                buttonStyle={{
                  borderRadius: '8px 0 0 8px',
                  border: '1px solid #d1d5db',
                  borderRight: 'none',
                  backgroundColor: isSaving ? '#f3f4f6' : 'white',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
              <input
                type="email"
                value={formData.business_email}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100 cursor-not-allowed"
                placeholder="Enter your email"
                disabled
                readOnly
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
              <PlacesAutocomplete
                value={formData.address_line1}
                onChange={(value) => handleInputChange('address_line1', value)}
                onSelect={handleAddressSelect}
                searchOptions={{
                  componentRestrictions: { country: 'us' },
                  types: ['address']
                }}
              >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                  <div className="relative">
                    <input
                      {...getInputProps({
                        placeholder: 'Start typing an address...',
                        className: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed',
                        disabled: isSaving,
                      })}
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-auto">
                        {loading && (
                          <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                        )}
                        {suggestions.map((suggestion) => {
                          const className = suggestion.active
                            ? 'px-4 py-2 cursor-pointer bg-primary/10 text-gray-900 text-sm'
                            : 'px-4 py-2 cursor-pointer hover:bg-gray-50 text-gray-700 text-sm';
                          return (
                            <div
                              key={suggestion.placeId}
                              {...getSuggestionItemProps(suggestion, {
                                className,
                              })}
                            >
                              {suggestion.description}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </PlacesAutocomplete>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
              <input
                type="text"
                value={formData.address_line2}
                onChange={(e) => handleInputChange('address_line2', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Apartment, suite, etc. (optional)"
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="City"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="State"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Zip code"
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Updating...' : 'Update Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageBasicInformation;
