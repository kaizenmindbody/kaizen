"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/useProfile";
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import 'react-phone-input-2/lib/style.css';
import { ProfileData } from '@/types/user';
import 'react-quill-new/dist/quill.snow.css';

// Profile components
import {
  Dashboard,
  Clinic,
  Events,
  HelpCenter,
  Support,
  ViewProfile,
  ManageBasicInformation,
  ManageServicesPricing,
  ManageDescriptions,
  ManageImagesVideo
} from './components';

// Dynamic imports for browser-only components
const PhoneInput = dynamic(() => import('react-phone-input-2'), {
  ssr: false,
  loading: () => <div className="w-full h-12 bg-gray-100 animate-pulse rounded-lg"></div>
});

const LanguageSelector = dynamic(() => import('react-language-selector-lite'), {
  ssr: false,
  loading: () => <div className="w-full h-12 bg-gray-100 animate-pulse rounded-lg"></div>
});

const Autocomplete = dynamic(
  () => import('@react-google-maps/api').then(mod => ({ default: mod.Autocomplete })),
  {
    ssr: false,
    loading: () => <input 
      type="text" 
      placeholder="Loading address autocomplete..." 
      className="w-full px-3 py-3 border rounded-lg bg-gray-100 border-gray-300"
      disabled 
    />
  }
);

// Using ProfileData from centralized types

// Skeleton Loading Component for Profile Page
const ProfilePageSkeleton = () => {
  return (
    <>
      {/* Hide header/nav/footer for admin-style layout */}
      <style jsx global>{`
        header, nav[class*="Header"], div[class*="Header"], nav[class*="Navbar"], div[class*="Navbar"], footer {
          display: none !important;
        }
        body {
          padding-top: 0 !important;
          margin-top: 0 !important;
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
        }
      `}</style>
      <div className="font-sans min-h-screen bg-gray-50">
        <div className="flex flex-col lg:flex-row min-h-screen animate-pulse">
          {/* Left Sidebar Skeleton */}
          <div className="fixed lg:w-64 lg:h-screen bg-white border-r border-gray-200 flex-shrink-0 w-64 top-0 left-0 z-50">
            <div className="p-4 h-full flex flex-col">
              {/* User Info Skeleton */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>

              {/* Navigation Skeleton */}
              <div className="flex-1 space-y-6">
                {/* Menu Section */}
                <div>
                  <div className="h-3 bg-gray-200 rounded w-16 mb-3"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>

                {/* Support Section */}
                <div>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-3"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-10 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sign Out Button Skeleton */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Main Content Area Skeleton */}
          <div className="flex-1 lg:ml-64">
            <div className="p-6 md:p-8 lg:p-12">
              <div className="max-w-7xl mx-auto">
                {/* Page Title Skeleton */}
                <div className="mb-6">
                  <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-96"></div>
                </div>

                {/* Content Card Skeleton */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="space-y-6">
                    {/* Form Fields Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i}>
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                          <div className="h-12 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>

                    {/* Additional Fields */}
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-32 bg-gray-200 rounded"></div>
                    </div>

                    {/* Buttons Skeleton */}
                    <div className="flex justify-end space-x-4 pt-4 border-t">
                      <div className="h-10 bg-gray-200 rounded w-24"></div>
                      <div className="h-10 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ProfilePage = () => {
  const { user, loading: authLoading, refreshProfile, userProfile } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileVersion, setProfileVersion] = useState(0); // Track profile updates
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const { updateProfile, isUpdating } = useProfile();
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isClient, setIsClient] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [availableDegrees, setAvailableDegrees] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch degrees from database
  useEffect(() => {
    const fetchDegrees = async () => {
      const { data, error } = await supabase
        .from('Degrees')
        .select('title')
        .order('title', { ascending: true });

      if (error) {
        console.error('Error fetching degrees:', error);
      } else if (data) {
        setAvailableDegrees(data.map(d => d.title));
      }
    };

    fetchDegrees();
  }, []);

  // Client-side only state initialization
  useEffect(() => {
    setIsClient(true);
    
    // URL parameter handling - only run on client
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const section = urlParams.get('section');
      if (section && ['dashboard', 'info', 'clinic', 'events', 'books', 'help', 'support'].includes(section)) {
        setActiveTab(
          section === 'dashboard' ? 'Dashboard' :
          section === 'info' ? 'Profile' :
          section === 'clinic' ? 'Clinic' :
          section === 'events' ? 'Events' :
          section === 'books' ? 'Books' :
          section === 'help' ? 'Help Center' :
          section === 'support' ? 'Support' : 'Dashboard'
        );
      }
    }
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const sectionMap: {[key: string]: string} = {
        'Dashboard': 'dashboard',
        'Profile': 'info',
        'View Profile': 'view-profile',
        'Manage Basic Information': 'basic-info',
        'Manage Services and Pricing': 'services-pricing',
        'Manage Descriptions': 'descriptions',
        'Manage Images and Video': 'media',
        'Clinic': 'clinic',
        'View Clinic Profile': 'view-clinic-profile',
        'Manage Practitioner Info': 'manage-practitioner-info',
        'Events': 'events',
        'Books': 'books',
        'Help Center': 'help',
        'Support': 'support'
      };
      const section = sectionMap[tab as keyof typeof sectionMap];

      // Create new URLSearchParams to avoid read-only issues
      const currentUrl = new URL(window.location.href);
      const newSearchParams = new URLSearchParams(currentUrl.search);
      newSearchParams.set('section', section);

      const newUrl = `${currentUrl.origin}${currentUrl.pathname}?${newSearchParams.toString()}`;
      window.history.pushState(null, '', newUrl);
    }
  };

  // Media upload states
  const [uploadingVideo, _setUploadingVideo] = useState(false);
  const [uploadingImages, _setUploadingImages] = useState(false);

  // Staged media (unsaved changes) - files held in memory until save
  const [stagedVideoFile, setStagedVideoFile] = useState<File | null>(null);
  const [stagedVideoUrl, setStagedVideoUrl] = useState<string | null>(null); // For preview
  const [stagedImages, setStagedImages] = useState<Array<{ url: string; file?: File; isNew: boolean }>>([]); // Track both URLs and files with metadata
  const [hasUnsavedMediaChanges, setHasUnsavedMediaChanges] = useState(false);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [imagesWereModified, setImagesWereModified] = useState(false); // Track if user made any image changes

  // Combined media for display (staged takes priority over saved)
  const mediaVideo = stagedVideoUrl === 'DELETED' ? null : (stagedVideoUrl || profile?.video || null);

  // For images, we need to merge existing images with staged changes
  const getDisplayImages = () => {
    if (stagedImages.length > 0) {
      // If we have staged changes, show all staged images (which includes existing + new)
      return stagedImages.map(img => img.url);
    }
    // If no staged changes, show saved images
    return profile?.images ? JSON.parse(profile.images) : [];
  };
  const mediaImages = getDisplayImages();

  // Different tabs for practitioners vs patients
  const tabs = profile?.type === 'Practitioner'
    ? ['Dashboard', 'Profile', ...(profile?.clinicpage === 'yes' ? ['Clinic'] : []), 'Events']
    : ['Dashboard', 'Profile', 'Books']; // Patients see Dashboard, Profile and Books tabs

  // Custom styles for React Select
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      padding: '0.25rem',
      minHeight: '48px',
      boxShadow: state.isFocused ? '0 0 0 2px #10b981' : 'none',
      borderColor: state.isFocused ? '#10b981' : '#d1d5db',
      backgroundColor: state.isDisabled ? '#f3f4f6' : 'white',
      cursor: state.isDisabled ? 'not-allowed' : 'default',
      '&:hover': {
        borderColor: state.isDisabled ? '#d1d5db' : '#10b981',
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#d1fae5' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#10b981' : '#d1fae5',
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6b7280',
    }),
    singleValue: (provided: any, state: any) => ({
      ...provided,
      color: state.isDisabled ? '#6b7280' : '#374151',
    }),
  };

  // Animated components for multi-select
  const animatedComponents = makeAnimated();

  const handleLanguageSelect = (language) => {
    if (language && language.name && !profile.languages.includes(language.name)) {
      const newLanguages = [...profile.languages, language.name];
      handleInputChange('languages', newLanguages);
    }
  };

  // Media upload handler functions (staged upload)
  const handleVideoUpload = (file: File | undefined) => {
    if (!file || !user) return;

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast.error('Video file size must be less than 50MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Clean up old preview URL
    if (stagedVideoUrl) {
      URL.revokeObjectURL(stagedVideoUrl);
    }

    // Create preview URL and stage the file
    const previewUrl = URL.createObjectURL(file);
    setStagedVideoFile(file);
    setStagedVideoUrl(previewUrl);
    setHasUnsavedMediaChanges(true);
  };

  const handleImagesUpload = (files: File[]) => {
    if (!files.length || !user) return;

    // Validate each file
    const maxSize = 10 * 1024 * 1024; // 10MB per image
    for (const file of files) {
      if (file.size > maxSize) {
        toast.error('Each image file must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select only image files');
        return;
      }
    }

    // If this is the first upload and we have no staged images, initialize with existing images
    if (stagedImages.length === 0 && profile?.images) {
      const existingImages = JSON.parse(profile.images).map((url: string) => ({
        url: url,
        file: undefined,
        isNew: false
      }));
      setStagedImages(existingImages);
    }

    // Create preview URLs and stage the files
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file: file,
      isNew: true
    }));

    // Add new images to staged images (existing + new)
    setStagedImages(prev => [...prev, ...newImages]);
    setHasUnsavedMediaChanges(true);
    setImagesWereModified(true);
  };



  // Clean up preview URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (stagedVideoUrl) {
        URL.revokeObjectURL(stagedVideoUrl);
      }
      for (const image of stagedImages) {
        if (image.isNew && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      }
    };
  }, [previewUrl, stagedVideoUrl, stagedImages]);

  // Save staged media changes to database
  const handleSaveMedia = async () => {
    if (!user || !hasUnsavedMediaChanges) return;

    setIsSavingMedia(true);
    try {
      const updateData: any = {};

      // Upload video to storage if there's a staged file
      if (stagedVideoFile) {
        const fileExt = stagedVideoFile.name.split('.').pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const filePath = `user_videos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('kaizen')
          .upload(filePath, stagedVideoFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('kaizen')
          .getPublicUrl(filePath);

        updateData.video = publicUrl;

        // Delete old video if exists
        if (profile?.video) {
          const oldVideoPath = profile.video.split('/').slice(-2).join('/');
          supabase.storage.from('kaizen').remove([oldVideoPath]).catch(console.error);
        }
      } else if (stagedVideoUrl === 'DELETED' && profile?.video) {
        // Video was deleted
        updateData.video = null;
        const oldVideoPath = profile.video.split('/').slice(-2).join('/');
        supabase.storage.from('kaizen').remove([oldVideoPath]).catch(console.error);
      }

      // Handle images if user made image changes
      if (imagesWereModified) {
        const finalImages: string[] = [];
        const existingImages = profile?.images ? JSON.parse(profile.images) : [];

        // Process each staged image
        for (const stagedImage of stagedImages) {
          if (stagedImage.isNew && stagedImage.file) {
            // Upload new image
            const fileExt = stagedImage.file.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `user_images/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('kaizen')
              .upload(filePath, stagedImage.file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('kaizen')
              .getPublicUrl(filePath);

            finalImages.push(publicUrl);
          } else {
            // Keep existing image
            finalImages.push(stagedImage.url);
          }
        }

        updateData.images = finalImages.length > 0 ? JSON.stringify(finalImages) : null;

        // Delete old images that were removed
        const removedImages = existingImages.filter((img: string) => !finalImages.includes(img));
        for (const removedImg of removedImages) {
          const imagePath = removedImg.split('/').slice(-2).join('/');
          supabase.storage.from('kaizen').remove([imagePath]).catch(console.error);
        }
      }

      // Update database
      const { error } = await supabase
        .from('Users')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Update profile state
      setProfile(prev => prev ? { ...prev, ...updateData } : null);

      // Clean up preview URLs
      if (stagedVideoUrl) {
        URL.revokeObjectURL(stagedVideoUrl);
      }
      for (const image of stagedImages) {
        if (image.isNew && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      }

      // Clear staged state
      setStagedVideoFile(null);
      setStagedVideoUrl(null);
      setStagedImages([]);
      setHasUnsavedMediaChanges(false);
      setImagesWereModified(false);

      toast.success('Media saved successfully!');

    } catch (error) {
      console.error('Error saving media:', error);
      toast.error('Failed to save media. Please try again.');
    } finally {
      setIsSavingMedia(false);
    }
  };

  // Discard staged media changes
  const handleDiscardMedia = () => {
    if (!hasUnsavedMediaChanges) return;

    if (!confirm('Are you sure you want to discard all unsaved media changes?')) {
      return;
    }

    // Clean up preview URLs
    if (stagedVideoUrl && stagedVideoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(stagedVideoUrl);
    }
    for (const image of stagedImages) {
      if (image.isNew && image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
    }

    // Reset staged state
    setStagedVideoFile(null);
    setStagedVideoUrl(null);
    setStagedImages([]);
    setHasUnsavedMediaChanges(false);
    setImagesWereModified(false);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Redirect EventHost to eventhost page
  useEffect(() => {
    if (!loading && profile && profile.type?.toLowerCase() === 'eventhost') {
      router.push('/eventhost');
    }
  }, [loading, profile, router]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('Users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        const profileData = {
          ...data,
          degree: data.degree || '',
          languages: data.languages ? JSON.parse(data.languages) : [],
          specialty: (() => {
            if (!data.specialty) return [];
            if (Array.isArray(data.specialty)) return data.specialty.filter(Boolean);
            if (typeof data.specialty === 'string') {
              try {
                const parsed = JSON.parse(data.specialty);
                if (Array.isArray(parsed)) {
                  return parsed.filter(Boolean);
                }
                return data.specialty.trim() ? [data.specialty.trim()] : [];
              } catch {
                return data.specialty.trim() ? [data.specialty.trim()] : [];
              }
            }
            return [data.specialty];
          })(),
          gender: data.gender || '',
          user_type: data.user_type || 'patient',
          date_of_birth: data.date_of_birth || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          medical_conditions: data.medical_conditions ? (Array.isArray(data.medical_conditions) ? data.medical_conditions : JSON.parse(data.medical_conditions || '[]')) : [],
          insurance_provider: data.insurance_provider || '',
          years_of_experience: data.years_of_experience || 0,
          specialty_rate: (() => {
            if (!data.specialty_rate) return {};
            try {
              return JSON.parse(data.specialty_rate);
            } catch {
              return {};
            }
          })(),
          // Media fields
          video: data.video || null,
          images: data.images || null
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
        setAddressInput(profileData.address || '');
        
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, profileVersion]); // Add profileVersion to refetch when needed

  // Refetch profile when switching to View Profile tab or when AuthContext profile updates
  useEffect(() => {
    if (activeTab === 'View Profile' && user) {
      setProfileVersion(prev => prev + 1); // Trigger profile refetch
    }
  }, [activeTab, user]);

  const handleInputChange = (field: string, value: string | number | string[]) => {
    if (!profile) return;

    setProfile(prev => ({
      ...prev!,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePhoneChange = (value: string) => {
    handleInputChange('phone', value);
  };

  const onLoadAutocomplete = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        setAddressInput(place.formatted_address);
        handleInputChange('address', place.formatted_address);
      }
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!profile?.full_name?.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!profile?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (profile?.website && !profile.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, avatar: 'Please select a valid image file.' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, avatar: 'Image size must be less than 5MB.' }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.avatar;
      return newErrors;
    });

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPendingAvatarFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  const deleteOldAvatar = async (avatarUrl: string): Promise<void> => {
    if (!avatarUrl) return;

    try {
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `avatars/${fileName}`;

      const { error: deleteError } = await supabase.storage
        .from('kaizen')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting old avatar:', deleteError);
      }
    } catch (error) {
      console.error('Error processing avatar deletion:', error);
    }
  };

  const uploadAvatarToStorage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      if (profile?.avatar) {
        await deleteOldAvatar(profile.avatar);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('kaizen')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Failed to upload image');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('kaizen')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!profile || !validateForm()) return;

    setIsSaving(true);
    setErrors({});

    try {
      let avatarUrl = profile.avatar;

      if (pendingAvatarFile) {
        try {
          avatarUrl = await uploadAvatarToStorage(pendingAvatarFile);
          if (!avatarUrl) {
            setErrors({ avatar: 'Failed to upload image. Please try again.' });
            return;
          }
        } catch {
          setErrors({ avatar: 'Failed to upload image. Please try again.' });
          return;
        }
      }

      const profileUpdate = {
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        avatar: avatarUrl,
        gender: profile.gender,
        languages: profile.languages,
        ...(profile.user_type === 'practitioner' && {
          degree: profile.degree || null,
          title: profile.title,
          specialty: JSON.stringify(Array.isArray(profile.specialty) ? profile.specialty.filter(Boolean).filter((spec, index, arr) => arr.indexOf(spec) === index) : []),
          clinic: profile.clinic,
          website: profile.website,
        }),
        // ...(profile.user_type === 'patient' && {
        //   date_of_birth: profile.date_of_birth || null,
        //   emergency_contact_name: profile.emergency_contact_name || null,
        //   emergency_contact_phone: profile.emergency_contact_phone || null,
        //   medical_conditions: profile.medical_conditions || [],
        //   insurance_provider: profile.insurance_provider || null,
        // })
      };

      const result = await updateProfile(profileUpdate);

      if (!result.success) {
        setErrors({ general: result.error || 'Failed to update profile' });
        return;
      }

      if (avatarUrl !== profile.avatar) {
        setProfile(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      }

      setPendingAvatarFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});

    if (originalProfile) {
      setProfile({ ...originalProfile });
      setAddressInput(originalProfile.address || '');
    }

    setPendingAvatarFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };


  const hasChanges = () => {
    if (!profile || !originalProfile) return false;

    if (pendingAvatarFile) return true;

    const fieldsToCompare = [
      'full_name', 'phone', 'address', 'title',
      'clinic', 'website', 'gender', 'years_of_experience',
      'date_of_birth', 'emergency_contact_name', 'emergency_contact_phone', 'insurance_provider'
    ];

    for (const field of fieldsToCompare) {
      if (profile[field as keyof ProfileData] !== originalProfile[field as keyof ProfileData]) {
        return true;
      }
    }

    if (profile.degree !== originalProfile.degree) {
      return true;
    }

    if (JSON.stringify(profile.languages) !== JSON.stringify(originalProfile.languages)) {
      return true;
    }

    if (JSON.stringify(profile.specialty) !== JSON.stringify(originalProfile.specialty)) {
      return true;
    }

    if (JSON.stringify(profile.medical_conditions) !== JSON.stringify(originalProfile.medical_conditions)) {
      return true;
    }

    return false;
  };

  // Delete video (staged or saved)
  const handleDeleteVideo = () => {
    // Clean up staged video if exists
    if (stagedVideoUrl && stagedVideoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(stagedVideoUrl);
    }

    // Reset staged video state and mark for deletion
    setStagedVideoFile(null);
    setStagedVideoUrl('DELETED'); // Use special marker to indicate deletion

    setHasUnsavedMediaChanges(true);
  };

  // Delete image (staged or saved)
  const handleDeleteImage = (index: number) => {
    // If we're working with saved images, stage them first
    if (stagedImages.length === 0 && profile?.images) {
      const savedImages = JSON.parse(profile.images).map((url: string) => ({
        url: url,
        file: undefined,
        isNew: false
      }));
      setStagedImages(savedImages);
    }

    // Get current images
    const currentImages = stagedImages.length > 0
      ? stagedImages
      : (profile?.images ? JSON.parse(profile.images).map((url: string) => ({ url, file: undefined, isNew: false })) : []);

    const imageToDelete = currentImages[index];

    // Clean up blob URL if it's a new image
    if (imageToDelete && imageToDelete.isNew && imageToDelete.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToDelete.url);
    }

    // Remove the image
    setStagedImages(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedMediaChanges(true);
    setImagesWereModified(true);
  };

  const getCurrentAvatarUrl = () => {
    return previewUrl || profile?.avatar || 'https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg';
  };

  // Don't render until client-side hydration is complete
  if (!isClient || authLoading || loading) {
    return <ProfilePageSkeleton />;
  }

  if (!profile) {
    return (
      <div className="mt-30 font-sans min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  const currentAvatarUrl = getCurrentAvatarUrl();

  return (
    <>
      {/* Hide header/nav/footer for admin-style layout */}
      <style jsx global>{`
        header, nav[class*="Header"], div[class*="Header"], nav[class*="Navbar"], div[class*="Navbar"], footer {
          display: none !important;
        }
        body {
          padding-top: 0 !important;
          margin-top: 0 !important;
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
        }
      `}</style>
    <div className="font-sans min-h-screen bg-gray-50">
      {/* General Error */}
      {errors.general && (
        <div className="mb-6 p-3 bg-red-100 border border-red-300 mx-4 mt-4 rounded-lg">
          <p className="text-red-700 text-sm">{errors.general}</p>
        </div>
      )}

      {/* Layout with Sidebar - Full Width */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* Left Sidebar Navigation - Fixed */}
        <div className={`
          fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex-shrink-0 z-50
          transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 h-full flex flex-col">
            {/* User Info */}
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                  <Image
                    src={currentAvatarUrl}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-gray-900 truncate">
                    {profile?.full_name || profile?.firstname || profile?.email?.split('@')[0] || 'User'}
                  </h1>
                  <p className="text-xs text-gray-500 truncate capitalize">
                    {profile?.type || 'User'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <nav className="space-y-6">
                {/* Menu Section */}
                <div>
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Menu
                  </h3>
                  <div className="space-y-1">
                    {tabs.map((tab) => {
                      const getIcon = (tabName: string) => {
                        switch(tabName) {
                          case 'Dashboard':
                            return (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                            );
                          case 'Profile':
                            return (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            );
                          case 'Clinic':
                            return (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            );
                          case 'Events':
                            return (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            );
                          case 'Books':
                            return (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            );
                          default:
                            return null;
                        }
                      };

                      // Profile sub-items
                      const profileSubItems = [
                        'View Profile',
                        'Manage Basic Information',
                        'Manage Services and Pricing',
                        'Manage Descriptions',
                        'Manage Images and Video'
                      ];

                      // Clinic sub-items
                      const clinicSubItems = [
                        'View Clinic Profile',
                        'Manage Practitioner Info'
                      ];

                      if (tab === 'Profile') {
                        return (
                          <div key={tab}>
                            <button
                              onClick={() => {
                                setExpandedMenu(expandedMenu === 'Profile' ? null : 'Profile');
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all text-sm ${
                                activeTab === 'Profile' || profileSubItems.includes(activeTab)
                                  ? 'bg-primary text-white shadow-sm'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                {getIcon(tab)}
                                <span>{tab}</span>
                              </div>
                              <svg
                                className={`w-4 h-4 transition-transform ${expandedMenu === 'Profile' ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {expandedMenu === 'Profile' && (
                              <div className="mt-1 ml-8 space-y-1">
                                {profileSubItems.map((subItem) => {
                                  const getSubItemIcon = (subItemName: string) => {
                                    switch(subItemName) {
                                      case 'View Profile':
                                        return (
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                        );
                                      case 'Manage Basic Information':
                                        return (
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        );
                                      case 'Manage Services and Pricing':
                                        return (
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                        );
                                      case 'Manage Descriptions':
                                        return (
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                          </svg>
                                        );
                                      case 'Manage Images and Video':
                                        return (
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        );
                                      default:
                                        return null;
                                    }
                                  };

                                  return (
                                    <button
                                      key={subItem}
                                      onClick={() => {
                                        handleTabChange(subItem);
                                        setIsMobileMenuOpen(false);
                                      }}
                                      className={`w-full flex items-center space-x-2 text-left px-3 py-2 rounded-lg font-medium transition-all text-xs ${
                                        activeTab === subItem
                                          ? 'bg-primary/20 text-primary'
                                          : 'text-gray-600 hover:bg-gray-50'
                                      }`}
                                    >
                                      {getSubItemIcon(subItem)}
                                      <span>{subItem}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      if (tab === 'Clinic') {
                        return (
                          <div key={tab}>
                            <button
                              onClick={() => {
                                setExpandedMenu(expandedMenu === 'Clinic' ? null : 'Clinic');
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all text-sm ${
                                activeTab === 'Clinic' || clinicSubItems.includes(activeTab)
                                  ? 'bg-primary text-white shadow-sm'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                {getIcon(tab)}
                                <span>{tab}</span>
                              </div>
                              <svg
                                className={`w-4 h-4 transition-transform ${expandedMenu === 'Clinic' ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {expandedMenu === 'Clinic' && (
                              <div className="mt-1 ml-8 space-y-1">
                                {clinicSubItems.map((subItem) => {
                                  const getClinicSubItemIcon = (subItemName: string) => {
                                    switch(subItemName) {
                                      case 'View Clinic Profile':
                                        return (
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                        );
                                      case 'Manage Practitioner Info':
                                        return (
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        );
                                      default:
                                        return null;
                                    }
                                  };

                                  return (
                                    <button
                                      key={subItem}
                                      onClick={() => {
                                        handleTabChange(subItem);
                                        setIsMobileMenuOpen(false);
                                      }}
                                      className={`w-full flex items-center space-x-2 text-left px-3 py-2 rounded-lg font-medium transition-all text-xs ${
                                        activeTab === subItem
                                          ? 'bg-primary/20 text-primary'
                                          : 'text-gray-600 hover:bg-gray-50'
                                      }`}
                                    >
                                      {getClinicSubItemIcon(subItem)}
                                      <span>{subItem}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <button
                          key={tab}
                          onClick={() => {
                            handleTabChange(tab);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-all text-sm ${
                            activeTab === tab
                              ? 'bg-primary text-white shadow-sm'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {getIcon(tab)}
                          <span>{tab}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Settings Section */}
                <div>
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Settings
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        handleTabChange('Help Center');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-all text-sm ${
                        activeTab === 'Help Center'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Help Center</span>
                    </button>
                    <a
                      href="mailto:help@kaizenmindbody.com"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-all text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Support</span>
                    </a>
                  </div>
                </div>
              </nav>
            </div>

            {/* Action Buttons at bottom */}
            <div className="p-3 border-t border-gray-200 mt-auto">
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all text-sm text-gray-700 hover:bg-gray-100 border border-gray-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Back to Main</span>
                </button>

                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push('/');
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all text-sm text-white bg-red-600 hover:bg-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Full Width with offset for sidebar */}
        <div className="flex-1 lg:ml-64">
          {/* Top Header Bar */}
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            {/* Hamburger Menu Button (Mobile Only) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">{activeTab}</h1>
              <p className="text-xs lg:text-sm text-gray-500 hidden lg:block">
                {activeTab === 'Dashboard' ? 'Overview and statistics' :
                 activeTab === 'Profile' ? 'Manage your profile information' :
                 activeTab === 'View Profile' ? 'View your public profile' :
                 activeTab === 'Manage Basic Information' ? 'Update basic information' :
                 activeTab === 'Manage Services and Pricing' ? 'Configure services and pricing' :
                 activeTab === 'Manage Descriptions' ? 'Edit professional bio' :
                 activeTab === 'Manage Images and Video' ? 'Upload and manage media' :
                 activeTab === 'Clinic' ? 'Clinic settings and information' :
                 activeTab === 'View Clinic Profile' ? 'View your clinic profile' :
                 activeTab === 'Manage Practitioner Info' ? 'Manage practitioner information' :
                 activeTab === 'Events' ? 'Events and appointments' :
                 activeTab === 'Books' ? 'Your appointments' :
                 activeTab === 'Help Center' ? 'Get help' :
                 activeTab === 'Support' ? 'Contact support' : ''}
              </p>
            </div>
          </div>

          <div className="p-4 md:p-6 lg:pl-4 lg:pr-8 lg:py-8">
            {activeTab === 'View Profile' && (
              <ViewProfile profile={profile} />
            )}

            {activeTab === 'Manage Basic Information' && (
              <ManageBasicInformation
                profile={profile}
                onProfileUpdate={() => setProfileVersion(prev => prev + 1)}
              />
            )}

            {activeTab === 'Manage Services and Pricing' && (
              <ManageServicesPricing profile={profile} />
            )}

            {activeTab === 'Manage Descriptions' && (
              <ManageDescriptions profile={profile} />
            )}

            {activeTab === 'Manage Images and Video' && (
              <ManageImagesVideo profile={profile} />
            )}

            {activeTab === 'Dashboard' && (
              <Dashboard profile={profile} handleTabChange={handleTabChange} />
            )}

            {activeTab === 'Clinic' && (
              <Clinic profile={profile} />
            )}

            {activeTab === 'View Clinic Profile' && (
              <Clinic profile={profile} />
            )}

            {activeTab === 'Manage Practitioner Info' && (
              <Clinic profile={profile} />
            )}

            {activeTab === 'Events' && (
              <Events profile={profile} />
            )}

            {activeTab === 'Help Center' && (
              <HelpCenter />
            )}

            {activeTab === 'Support' && (
              <Support />
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProfilePage;
