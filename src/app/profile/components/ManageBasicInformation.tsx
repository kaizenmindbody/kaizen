"use client";

import { ProfileData } from '@/types/user';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useDegrees } from '@/hooks/useDegrees';
import { usePractitionerTypes } from '@/hooks/usePractitionerTypes';
import { useBasicInformation } from '@/hooks/useBasicInformation';
import Image from 'next/image';
import 'react-phone-input-2/lib/style.css';
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';

const PhoneInput = dynamic(() => import('react-phone-input-2'), {
  ssr: false,
  loading: () => <div className="w-full h-12 bg-gray-100 animate-pulse rounded-lg"></div>
});

interface ManageBasicInformationProps {
  profile: ProfileData | null;
  onProfileUpdate?: () => void;
}

const ManageBasicInformation: React.FC<ManageBasicInformationProps> = ({ profile, onProfileUpdate }) => {
  const { user, refreshProfile } = useAuth();
  const { degrees } = useDegrees();
  const { practitionerTypes } = usePractitionerTypes();
  const {
    saving,
    uploadingAvatar,
    error,
    successMessage,
    uploadAvatar,
    removeAvatar,
    updateBasicInfo,
    clearError,
    clearSuccessMessage,
  } = useBasicInformation();

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
    type_of_practitioner: profile?.ptype || '',
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

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar || null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const placekitInstance = useRef<any>(null);

  // Show success/error toasts
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      clearSuccessMessage();
    }
  }, [successMessage, clearSuccessMessage]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user?.id) return;

    const success = await uploadAvatar(user.id, avatarFile, profile?.avatar || null);

    if (success) {
      setAvatarFile(null);
      await refreshProfile();

      // Notify parent component to refetch profile
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    }
    // Error toast will be shown by the useEffect hook
  };

  const handleAvatarRemove = async () => {
    if (!user?.id || !profile?.avatar) return;

    const success = await removeAvatar(user.id, profile.avatar);

    if (success) {
      setAvatarPreview(null);
      setAvatarFile(null);
      await refreshProfile();

      // Notify parent component to refetch profile
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    }
    // Error toast will be shown by the useEffect hook
  };

  // Initialize PlaceKit autocomplete
  useEffect(() => {
    const initPlaceKit = async () => {
      if (!addressInputRef.current || placekitInstance.current) return;

      try {
        // Dynamically import PlaceKit to avoid SSR issues
        const placekit = await import('@placekit/autocomplete-js');

        const apiKey = process.env.NEXT_PUBLIC_PLACEKIT_API_KEY;
        if (!apiKey) {
          console.error('PlaceKit API key is not configured');
          return;
        }

        placekitInstance.current = placekit.default(apiKey, {
          target: addressInputRef.current,
          countries: ['us', 'ca'],
          types: ['street', 'city', 'administrative'],
          maxResults: 5,
          panel: {
            className: 'placekit-panel',
          },
        });

        // Listen for address selection
        placekitInstance.current.on('pick', (value: any, item: any) => {
          // Extract zip code - handle both string and array formats
          const zipCode = Array.isArray(item.zipcode)
            ? item.zipcode[0] || ''
            : item.zipcode || '';

          // Update all address fields in React state
          setFormData(prev => ({
            ...prev,
            address_line1: item.name || '',
            city: item.city || '',
            state: item.administrative || '',
            zip_code: zipCode,
          }));

          console.log('Address selected:', {
            address_line1: item.name || '',
            city: item.city || '',
            state: item.administrative || '',
            zip_code: zipCode,
          });

          // Close the dropdown by blurring the input
          setTimeout(() => {
            if (addressInputRef.current) {
              addressInputRef.current.blur();
            }
          }, 100);
        });

      } catch (error) {
        console.error('Error initializing PlaceKit:', error);
      }
    };

    initPlaceKit();

    // Cleanup
    return () => {
      if (placekitInstance.current) {
        placekitInstance.current.destroy();
        placekitInstance.current = null;
      }
    };
  }, []);

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

    const success = await updateBasicInfo(user.id, formData);

    if (success) {
      // Refresh profile data in AuthContext
      await refreshProfile();

      // Notify parent component to refetch profile
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    }
    // Error toast will be shown by the useEffect hook
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
        type_of_practitioner: profile.ptype || '',
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
        type_of_practitioner: profile.ptype || '',
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

      setAvatarPreview(profile.avatar || null);
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

      {/* Avatar Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Avatar</h3>
        <div className="flex items-center space-x-6">
          {/* Avatar Preview */}
          <div className="relative">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt="Avatar"
                width={120}
                height={120}
                className="w-30 h-30 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="pi pi-upload mr-2"></i>
                  Choose Avatar
                </button>

                {avatarFile && (
                  <button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingAvatar ? (
                      <>
                        <i className="pi pi-spin pi-spinner mr-2"></i>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="pi pi-check mr-2"></i>
                        Save Avatar
                      </>
                    )}
                  </button>
                )}

                {avatarPreview && !avatarFile && (
                  <button
                    type="button"
                    onClick={handleAvatarRemove}
                    disabled={uploadingAvatar}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="pi pi-trash mr-2"></i>
                    Remove Avatar
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-500">
                Recommended: Square image, at least 200x200px. Max size: 5MB
              </p>
            </div>
          </div>
        </div>
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
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
                isDisabled={saving}
              />
            </div>
          </div>

          {/* Practitioner Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type of Practitioner</label>
            <Select
              value={formData.type_of_practitioner ? { value: formData.type_of_practitioner, label: formData.type_of_practitioner } : null}
              onChange={(option) => handleInputChange('type_of_practitioner', option?.value || '')}
              options={practitionerTypes.map(type => ({ value: type.title, label: type.title }))}
              styles={customSelectStyles}
              placeholder="Select practitioner type"
              isClearable
              isDisabled={saving}
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
              disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
              <PhoneInput
                country={'us'}
                value={formData.business_phone}
                onChange={(value) => handleInputChange('business_phone', value)}
                disabled={saving}
                inputProps={{
                  name: 'business_phone',
                  disabled: saving,
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
                  backgroundColor: saving ? '#f3f4f6' : 'white',
                  cursor: saving ? 'not-allowed' : 'text',
                }}
                buttonStyle={{
                  borderRadius: '8px 0 0 8px',
                  border: '1px solid #d1d5db',
                  borderRight: 'none',
                  backgroundColor: saving ? '#f3f4f6' : 'white',
                  cursor: saving ? 'not-allowed' : 'pointer',
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
              <input
                ref={addressInputRef}
                type="text"
                value={formData.address_line1 || ''}
                onChange={(e) => handleInputChange('address_line1', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Start typing your address..."
                disabled={saving}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
              <input
                type="text"
                value={formData.address_line2 || ''}
                onChange={(e) => handleInputChange('address_line2', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Apartment, suite, etc. (optional)"
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="City"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="State"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                <input
                  type="text"
                  value={formData.zip_code || ''}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Zip code"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Updating...' : 'Update Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageBasicInformation;
