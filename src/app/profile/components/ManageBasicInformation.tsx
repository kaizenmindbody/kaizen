"use client";

import { ProfileData } from '@/types/user';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';
import Select, { MultiValue } from 'react-select';
import makeAnimated from 'react-select/animated';
import { useDegrees } from '@/hooks/useDegrees';
import { usePractitionerTypes } from '@/hooks/usePractitionerTypes';
import { useBasicInformation } from '@/hooks/useBasicInformation';
import Image from 'next/image';
import { Plus, X } from 'lucide-react';
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

// Helper function to capitalize names properly (e.g., "chris smith" -> "Chris Smith")
const capitalizeName = (name: string): string => {
  if (!name) return '';

  // Split by spaces and hyphens to handle compound names
  return name
    .split(/(\s+|-)/)
    .map((part, index, array) => {
      // Keep spaces and hyphens as is
      if (part === ' ' || part === '-' || part === '') return part;

      // Handle special cases like "McDonald", "O'Brien", etc.
      if (part.toLowerCase().startsWith('mc') && part.length > 2) {
        return 'Mc' + part.charAt(2).toUpperCase() + part.slice(3).toLowerCase();
      }
      if (part.toLowerCase().startsWith("o'") && part.length > 2) {
        return "O'" + part.charAt(2).toUpperCase() + part.slice(3).toLowerCase();
      }

      // Standard capitalization: first letter uppercase, rest lowercase
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
};

// Helper function to parse degree field
const parseDegree = (degree: any): string[] => {
  if (!degree) return [];

  // If it's already an array, return it
  if (Array.isArray(degree)) {
    return degree.filter(Boolean).map(d => String(d).trim());
  }

  // If it's a string, try to parse it
  if (typeof degree === 'string') {
    const trimmed = degree.trim();

    // Check if it's a JSON array string
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).map(d => String(d).trim());
        }
      } catch (e) {
        // If JSON parsing fails, fall through to comma-separated parsing
      }
    }

    // Treat as comma-separated string
    return trimmed.split(',').map(d => d.trim()).filter(Boolean);
  }

  return [];
};

// Helper function to parse practitioner type field (same logic as degree)
const parsePractitionerType = (ptype: any): string[] => {
  if (!ptype) return [];

  // If it's already an array, return it
  if (Array.isArray(ptype)) {
    return ptype.filter(Boolean).map(d => String(d).trim());
  }

  // If it's a string, try to parse it
  if (typeof ptype === 'string') {
    const trimmed = ptype.trim();

    // Check if it's a JSON array string
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter(Boolean).map(d => String(d).trim());
        }
      } catch (e) {
        // If JSON parsing fails, fall through to comma-separated parsing
      }
    }

    // Treat as comma-separated string
    return trimmed.split(',').map(d => d.trim()).filter(Boolean);
  }

  return [];
};

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

  // Helper function to parse business emails from profile (excluding login email)
  const parseBusinessEmails = (emails: any, loginEmail: string): string[] => {
    const loginEmailLower = loginEmail?.toLowerCase().trim();
    
    if (!emails) {
      // If no business emails, return empty array (login email will be shown separately)
      return [];
    }
    
    let parsedEmails: string[] = [];
    
    if (Array.isArray(emails)) {
      parsedEmails = emails.filter(email => email && email.trim() !== '');
    } else if (typeof emails === 'string') {
      const trimmed = emails.trim();
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            parsedEmails = parsed.filter(email => email && email.trim() !== '');
          }
        } catch {
          // If JSON parsing fails, treat as single email
          parsedEmails = trimmed ? [trimmed] : [];
        }
      } else {
        parsedEmails = trimmed ? [trimmed] : [];
      }
    }
    
    // Filter out login email from business emails
    return parsedEmails.filter(email => email.toLowerCase().trim() !== loginEmailLower);
  };

  const [formData, setFormData] = useState({
    first_name: capitalizeName(profile?.firstname || ''),
    last_name: capitalizeName(profile?.lastname || ''),
    title: profile?.title || '',
    degree: parseDegree(profile?.degree),
    type_of_practitioner: parsePractitionerType(profile?.ptype),
    clinic_name: profile?.clinic || '',
    create_clinic_page: profile?.clinicpage || 'no',
    website: profile?.website || '',
    business_phone: profile?.phone || '',
    business_emails: parseBusinessEmails(profile?.business_emails, profile?.email || user?.email || ''),
    address: profile?.address || '',
  });

  // Separate address fields for UI display
  const [addressFields, setAddressFields] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar || null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const placekitInstance = useRef<any>(null);
  const animatedComponents = makeAnimated();

  // Show success/error toasts
  useEffect(() => {
    if (error) {
      showToast.error(error);
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (successMessage) {
      showToast.success(successMessage);
      clearSuccessMessage();
    }
  }, [successMessage, clearSuccessMessage]);

  const handleInputChange = (field: string, value: string | string[]) => {
    // Apply capitalization for name fields
    if (field === 'first_name' || field === 'last_name') {
      const capitalizedValue = typeof value === 'string' ? capitalizeName(value) : value;
      setFormData(prev => ({ ...prev, [field]: capitalizedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Email management functions
  const handleEmailChange = (index: number, value: string) => {
    setFormData(prev => {
      const newEmails = [...(prev.business_emails || [])];
      newEmails[index] = value;
      return { ...prev, business_emails: newEmails };
    });
  };

  const handleAddEmail = () => {
    setFormData(prev => ({
      ...prev,
      business_emails: [...(prev.business_emails || []), '']
    }));
  };

  const handleRemoveEmail = (index: number) => {
    setFormData(prev => {
      const newEmails = [...(prev.business_emails || [])];
      newEmails.splice(index, 1);
      return { ...prev, business_emails: newEmails };
    });
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    if (!email || email.trim() === '') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleAddressFieldChange = (field: keyof typeof addressFields, value: string) => {
    setAddressFields(prev => ({ ...prev, [field]: value }));
  };

  // Combine address fields into single string
  const combineAddressFields = () => {
    // Don't filter out empty fields - preserve their positions
    const parts = [
      addressFields.address1?.trim() || '',
      addressFields.address2?.trim() || '',
      addressFields.city?.trim() || '',
      addressFields.state?.trim() || '',
      addressFields.zip?.trim() || '',
    ];

    return parts.join(', ');
  };

  // Parse address string into separate fields
  const parseAddress = (addressString: string) => {
    if (!addressString) {
      return {
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        country: 'US',
      };
    }

    // Split by comma but DON'T filter out empty strings yet
    // This preserves the position of fields even if some are empty
    const parts = addressString.split(',').map(p => p.trim());

    // Improved parsing logic that handles empty fields correctly
    // Expected format: address1, address2, city, state, zip
    const parsed = {
      address1: parts[0] || '',
      address2: parts[1] || '',
      city: parts[2] || '',
      state: parts[3] || '',
      zip: parts[4] || '',
      country: 'US',
    };

    return parsed;
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Image size must be less than 5MB');
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
      // Only run on client-side
      if (typeof window === 'undefined') return;
      if (!addressInputRef.current || placekitInstance.current) return;

      try {
        // Dynamically import PlaceKit to avoid SSR issues
        const placekit = await import('@placekit/autocomplete-js');

        const apiKey = process.env.NEXT_PUBLIC_PLACEKIT_API_KEY;
        if (!apiKey) {
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

          // Populate separate address fields
          setAddressFields({
            address1: item.name || '',
            address2: '',
            city: item.city || '',
            state: item.administrative || '',
            zip: zipCode,
            country: item.country || 'US',
          });

          // Close the dropdown by blurring the input
          setTimeout(() => {
            if (addressInputRef.current) {
              addressInputRef.current.blur();
            }
          }, 100);
        });

      } catch (error) {
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
      showToast.error('User not authenticated');
      return;
    }

    // Validation
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      showToast.error('First name and last name are required');
      return;
    }

    if (formData.website && !formData.website.startsWith('http')) {
      showToast.error('Website must start with http:// or https://');
      return;
    }

    // Validate business emails
    if (formData.business_emails && formData.business_emails.length > 0) {
      const invalidEmails = formData.business_emails.filter(email => email.trim() !== '' && !isValidEmail(email));
      if (invalidEmails.length > 0) {
        showToast.error(`Please enter valid email addresses: ${invalidEmails.join(', ')}`);
        return;
      }
    }

    // Upload avatar first if there's a pending file
    if (avatarFile) {
      const avatarSuccess = await uploadAvatar(user.id, avatarFile, profile?.avatar || null);
      if (!avatarSuccess) {
        showToast.error('Failed to upload avatar. Please try again.');
        return;
      }
      // Clear the pending avatar file after successful upload
      setAvatarFile(null);
    }

    // Create updated form data with separate address fields, degree, and practitioner type as strings
    // Apply capitalization to names before saving
    const dataToSave = {
      first_name: capitalizeName(formData.first_name),
      last_name: capitalizeName(formData.last_name),
      title: formData.title,
      degree: Array.isArray(formData.degree) ? formData.degree.join(', ') : formData.degree,
      type_of_practitioner: Array.isArray(formData.type_of_practitioner)
        ? formData.type_of_practitioner.join(', ')
        : formData.type_of_practitioner,
      clinic_name: formData.clinic_name,
      create_clinic_page: formData.create_clinic_page,
      website: formData.website,
      business_phone: formData.business_phone,
      business_emails: formData.business_emails
        ? formData.business_emails
            .map(email => email.trim())
            .filter(email => email !== '')
        : [],
      // Send separate address fields instead of combined address
      address_line1: addressFields.address1,
      address_line2: addressFields.address2,
      city: addressFields.city,
      state: addressFields.state,
      zip_code: addressFields.zip,
    };

    const success = await updateBasicInfo(user.id, dataToSave);

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
      setFormData({
        first_name: capitalizeName(profile.firstname || ''),
        last_name: capitalizeName(profile.lastname || ''),
        title: profile.title || '',
        degree: parseDegree(profile.degree),
        type_of_practitioner: parsePractitionerType(profile.ptype),
        clinic_name: profile.clinic || '',
        create_clinic_page: profile.clinicpage || 'no',
        website: profile.website || '',
        business_phone: profile.phone || '',
        business_emails: parseBusinessEmails(profile.business_emails, profile.email || user?.email || ''),
        address: profile.address || '',
      });

      // Reset address fields
      setAddressFields(parseAddress(profile.address || ''));

      // Reset avatar file and preview
      setAvatarFile(null);
      setAvatarPreview(profile.avatar || null);
    }
  };

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      const parsedPtype = parsePractitionerType(profile.ptype);

      setFormData({
        first_name: profile.firstname || '',
        last_name: profile.lastname || '',
        title: profile.title || '',
        degree: parseDegree(profile.degree),
        type_of_practitioner: parsedPtype,
        clinic_name: profile.clinic || '',
        create_clinic_page: profile.clinicpage || 'no',
        website: profile.website || '',
        business_phone: profile.phone || '',
        business_emails: parseBusinessEmails(profile.business_emails, profile.email || user?.email || ''),
        address: profile.address || '',
      });

      // Parse address into separate fields
      setAddressFields(parseAddress(profile.address || ''));

      // Only update avatar preview if there's no pending avatar file
      if (!avatarFile) {
        setAvatarPreview(profile.avatar || null);
      }
    }
  }, [profile, avatarFile]);

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
                  disabled={saving || uploadingAvatar}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {avatarFile ? 'Change Avatar' : 'Choose Avatar'}
                </button>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleAvatarRemove}
                    disabled={saving || uploadingAvatar}
                    className="px-4 py-2 bg-[#8ED083] text-white rounded-lg hover:bg-[#7FC071] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove Avatar
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-500">
                {avatarFile
                  ? 'New avatar selected. Click "Update Changes" below to save.'
                  : 'Recommended: Square image, at least 200x200px. Max size: 5MB'
                }
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
              <Select
                value={formData.title ? { value: formData.title, label: formData.title } : null}
                onChange={(option) => handleInputChange('title', option?.value || '')}
                options={[{ value: 'Dr', label: 'Dr' }]}
                styles={customSelectStyles}
                placeholder="Select title"
                isClearable
                isDisabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Degrees</label>
              <Select
                isMulti
                components={animatedComponents}
                value={Array.isArray(formData.degree)
                  ? formData.degree.map(d => ({ value: d, label: d }))
                  : []
                }
                onChange={(options: MultiValue<{ value: string; label: string }>) => handleInputChange('degree', options ? options.map(opt => opt.value) : [])}
                options={degrees.map(degree => ({ value: degree.title, label: degree.title }))}
                styles={customSelectStyles}
                placeholder="Select your degrees"
                isDisabled={saving}
              />
            </div>
          </div>

          {/* Practitioner Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type of Practitioner</label>
            <Select
              key={`practitioner-types-${JSON.stringify(formData.type_of_practitioner)}`}
              isMulti
              components={animatedComponents}
              value={Array.isArray(formData.type_of_practitioner)
                ? formData.type_of_practitioner.map(p => ({ value: p, label: p }))
                : []
              }
              onChange={(options: MultiValue<{ value: string; label: string }>) => handleInputChange('type_of_practitioner', options ? options.map(opt => opt.value) : [])}
              options={practitionerTypes.map(type => ({ value: type.title, label: type.title }))}
              styles={customSelectStyles}
              placeholder="Select practitioner types"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Email(s)
              </label>
              
              {/* Login Email (Read-only) */}
              <div className="mb-3">
                <label className="block text-xs text-gray-500 mb-1">Login Email (Default)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>

              {/* Business Emails (Editable) */}
              <div className="space-y-2">
                {formData.business_emails && formData.business_emails.length > 0 && (
                  <label className="block text-xs text-gray-500 mb-1">Additional Business Emails</label>
                )}
                {formData.business_emails?.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder={`Business email ${index + 1}`}
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(index)}
                      disabled={saving}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove email"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddEmail}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:text-primary/80 hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-dashed border-gray-300 hover:border-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add Business Email
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Add additional business email addresses. Your login email will always be displayed as the default contact email.
              </p>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-gray-800">Address Information</h3>

            {/* Address Line 1 with PlaceKit autocomplete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 <span className="text-gray-500 text-xs">(Street Address)</span>
              </label>
              <input
                ref={addressInputRef}
                type="text"
                value={addressFields.address1}
                onChange={(e) => handleAddressFieldChange('address1', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Start typing your address..."
                disabled={saving}
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-1">
                Start typing to search for your address
              </p>
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2 <span className="text-gray-500 text-xs">(Apt, Suite, Unit, etc. - Optional)</span>
              </label>
              <input
                type="text"
                value={addressFields.address2}
                onChange={(e) => handleAddressFieldChange('address2', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Apartment, suite, unit, building, floor, etc."
                disabled={saving}
              />
            </div>

            {/* City, State, Zip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={addressFields.city}
                  onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="City"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={addressFields.state}
                  onChange={(e) => handleAddressFieldChange('state', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="State"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={addressFields.zip}
                  onChange={(e) => handleAddressFieldChange('zip', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="ZIP"
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
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                'Update Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageBasicInformation;
