"use client";

import { ProfileData } from '@/types/user';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useService } from '@/hooks/useService';
import { useServicePricing } from '@/hooks/useServicePricing';
import { ServicePricing, PackagePricing } from '@/store/slices/servicePricingSlice';
import { useAppDispatch } from '@/store/hooks';
import { resetServicePricing } from '@/store/slices/servicePricingSlice';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Building2, Globe, Phone, Mail, MapPin, Upload, X, Film, Image as ImageIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'react-phone-input-2/lib/style.css';
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';

interface UpdateClinicProfileProps {
  profile: ProfileData | null;
}

interface ClinicInfo {
  clinic_name: string;
  clinic_website: string;
  clinic_phone: string;
  clinic_email: string;
  clinic_address: string;
  clinic_logo: string;
}

// Dynamic import for PhoneInput component
const PhoneInput = dynamic(() => import('react-phone-input-2'), {
  ssr: false,
  loading: () => <div className="w-full h-12 bg-gray-100 animate-pulse rounded-lg"></div>
});

const UpdateClinicProfile: React.FC<UpdateClinicProfileProps> = ({ profile }) => {
  const dispatch = useAppDispatch();
  const { services: availableServices, loading: servicesLoading } = useService();

  const {
    servicePricings: storePricings,
    packagePricings: storePackagePricings,
    saving,
    saveServicePricing,
  } = useServicePricing(profile?.id, true); // true = clinic-specific pricing

  // Clinic Information State
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>({
    clinic_name: '',
    clinic_website: '',
    clinic_phone: '',
    clinic_email: '',
    clinic_address: '',
    clinic_logo: '',
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

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Media upload states
  const [clinicVideoFile, setClinicVideoFile] = useState<File | null>(null);
  const [clinicVideoPreview, setClinicVideoPreview] = useState<string | null>(null);
  const [clinicImages, setClinicImages] = useState<Array<{ file?: File; url: string; isNew: boolean }>>([]);
  const [existingVideo, setExistingVideo] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [videoDeleted, setVideoDeleted] = useState(false);

  // PlaceKit ref
  const addressInputRef = useRef<HTMLInputElement>(null);
  const placekitInstance = useRef<any>(null);

  // Address field handlers
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

    // Split by comma but DON'T filter out empty strings
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

  // Filter services
  const realServices = useMemo(() => {
    const filtered = availableServices.filter(service => service.type === 'real');
    console.log('Real services:', filtered);
    return filtered;
  }, [availableServices]);

  const virtualServices = useMemo(() => {
    const filtered = availableServices.filter(service => service.type === 'virtual');
    console.log('Virtual services:', filtered);
    return filtered;
  }, [availableServices]);

  // Services and Pricing State
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

  // Reset service pricing state on component mount to trigger fresh data fetch
  useEffect(() => {
    // Reset the service pricing state to ensure fresh data is fetched
    // The useServicePricing hook will automatically fetch when initialized is false
    dispatch(resetServicePricing());
  }, [dispatch]);

  // Load clinic information from Clinics table
  useEffect(() => {
    const fetchClinicInfo = async () => {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from('Clinics')
        .select('*')
        .eq('practitioner_id', profile.id)
        .single();

      if (data && !error) {
        setClinicInfo({
          clinic_name: data.clinic_name || '',
          clinic_website: data.clinic_website || '',
          clinic_phone: data.clinic_phone || '',
          clinic_email: data.clinic_email || '',
          clinic_address: data.clinic_address || '',
          clinic_logo: data.clinic_logo || '',
        });

        // Parse address into separate fields
        setAddressFields(parseAddress(data.clinic_address || ''));

        // Load existing video
        if (data.clinic_video) {
          setExistingVideo(data.clinic_video);
        }

        // Load existing images
        if (data.clinic_images && Array.isArray(data.clinic_images)) {
          const imageObjects = data.clinic_images.map((url: string) => ({
            url,
            isNew: false
          }));
          setClinicImages(imageObjects);
          setExistingImages(data.clinic_images);
        }
      }
    };

    fetchClinicInfo();
  }, [profile]);

  // Initialize PlaceKit for address autocomplete
  useEffect(() => {
    const initPlaceKit = async () => {
      // Only run on client-side
      if (typeof window === 'undefined') return;
      if (!addressInputRef.current || placekitInstance.current) return;

      try {
        const placekit = await import('@placekit/autocomplete-js');

        const pk = placekit.default(process.env.NEXT_PUBLIC_PLACEKIT_API_KEY || '', {
          target: addressInputRef.current,
          countries: ['us', 'ca'],
          maxResults: 5,
        });

        pk.on('pick', (value, item) => {
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

          console.log('Address selected:', {
            address1: item.name,
            city: item.city,
            state: item.administrative,
            zip: zipCode,
          });

          // Close the dropdown by blurring the input
          setTimeout(() => {
            if (addressInputRef.current) {
              addressInputRef.current.blur();
            }
          }, 100);
        });

        placekitInstance.current = pk;
      } catch (error) {
        console.error('Error initializing PlaceKit:', error);
      }
    };

    initPlaceKit();

    return () => {
      if (placekitInstance.current) {
        placekitInstance.current.destroy();
        placekitInstance.current = null;
      }
    };
  }, []);

  // Sync service pricing with store data
  useEffect(() => {
    const inPersonServices = storePricings.filter(sp => sp.service_category === 'In-Person / Clinic Visit');
    const virtualServicesList = storePricings.filter(sp => sp.service_category === 'Virtual Visit');

    // Update in-person services
    if (inPersonServices.length > 0) {
      setServicePricings(inPersonServices);
    } else if (storePricings.length === 0) {
      // Reset to initial empty state if no data from store
      setServicePricings([{
        service_name: '',
        first_time_price: '',
        first_time_duration: '',
        returning_price: '',
        returning_duration: '',
        is_sliding_scale: false,
        sliding_scale_info: '',
        service_category: 'In-Person / Clinic Visit',
      }]);
    }

    // Update virtual services
    if (virtualServicesList.length > 0) {
      setVirtualPricings(virtualServicesList);
    } else if (storePricings.length === 0) {
      // Reset to initial empty state if no data from store
      setVirtualPricings([{
        service_name: '',
        first_time_price: '',
        first_time_duration: '',
        returning_price: '',
        returning_duration: '',
        is_sliding_scale: false,
        sliding_scale_info: '',
        service_category: 'Virtual Visit',
      }]);
    }

    // Update packages
    if (storePackagePricings.length > 0) {
      setPackagePricings(storePackagePricings);
    } else {
      // Reset to initial empty state if no data from store
      setPackagePricings([{
        service_name: '',
        no_of_sessions: '',
        price: '',
        service_category: 'Packages',
      }]);
    }
  }, [storePricings, storePackagePricings]);

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload logo to storage
  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !profile?.id) return null;

    try {
      setUploadingLogo(true);

      // Generate unique filename
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${profile.id}-clinic-${Date.now()}.${fileExt}`;
      const filePath = `clinic_logos/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('kaizen')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kaizen')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle video file selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video size must be less than 50MB');
        return;
      }

      setClinicVideoFile(file);

      // Create preview
      const url = URL.createObjectURL(file);
      setClinicVideoPreview(url);
    }
  };

  // Remove video
  const handleRemoveVideo = () => {
    if (clinicVideoPreview) {
      URL.revokeObjectURL(clinicVideoPreview);
    }
    setClinicVideoFile(null);
    setClinicVideoPreview(null);
    setVideoDeleted(true);
  };

  // Handle image files selection
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Check if adding these files would exceed 10 images
    if (clinicImages.length + files.length > 10) {
      toast.error('You can upload a maximum of 10 images');
      return;
    }

    // Validate each file
    const validFiles: Array<{ file: File; url: string; isNew: boolean }> = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 10MB`);
        continue;
      }

      const url = URL.createObjectURL(file);
      validFiles.push({ file, url, isNew: true });
    }

    if (validFiles.length > 0) {
      setClinicImages([...clinicImages, ...validFiles]);
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    const imageToRemove = clinicImages[index];

    // Revoke object URL if it's a new image
    if (imageToRemove.isNew && imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    setClinicImages(clinicImages.filter((_, i) => i !== index));
  };

  // Upload video to storage
  const uploadVideo = async (): Promise<string | null> => {
    if (!clinicVideoFile || !profile?.id) return null;

    try {
      const fileExt = clinicVideoFile.name.split('.').pop();
      const fileName = `${profile.id}-clinic-${Date.now()}.${fileExt}`;
      const filePath = `clinic_videos/${fileName}`;

      const { error } = await supabase.storage
        .from('kaizen')
        .upload(filePath, clinicVideoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('kaizen')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Failed to upload video');
      return null;
    }
  };

  // Upload images to storage
  const uploadImages = async (): Promise<string[]> => {
    if (!profile?.id) return [];

    const uploadedUrls: string[] = [];
    const newImages = clinicImages.filter(img => img.isNew && img.file);

    for (const imageObj of newImages) {
      if (!imageObj.file) continue;

      try {
        const fileExt = imageObj.file.name.split('.').pop();
        const fileName = `${profile.id}-clinic-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `clinic_images/${fileName}`;

        const { error } = await supabase.storage
          .from('kaizen')
          .upload(filePath, imageObj.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('kaizen')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload some images');
      }
    }

    return uploadedUrls;
  };

  // Handle service changes
  const handleServiceChange = (
    index: number,
    field: keyof ServicePricing,
    value: any,
    category: 'In-Person / Clinic Visit' | 'Virtual Visit'
  ) => {
    const serviceList = category === 'In-Person / Clinic Visit' ? realServices : virtualServices;
    const pricingList = category === 'In-Person / Clinic Visit' ? servicePricings : virtualPricings;
    const setPricingList = category === 'In-Person / Clinic Visit' ? setServicePricings : setVirtualPricings;

    const updated = [...pricingList];

    if (field === 'service_name') {
      const selectedService = serviceList.find(s => s.title.trim() === value.trim());
      console.log('Service selected:', {
        category,
        value,
        trimmedValue: value.trim(),
        selectedService,
        service_id: selectedService?.id,
        serviceListCount: serviceList.length,
        availableServiceTitles: serviceList.map(s => s.title)
      });
      updated[index] = {
        ...updated[index],
        [field]: value,
        service_id: selectedService?.id
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    console.log('Updated service pricing:', updated[index]);
    setPricingList(updated);
  };

  // Handle package changes
  const handlePackageChange = (index: number, field: keyof PackagePricing, value: any) => {
    const updated = [...packagePricings];

    if (field === 'service_name') {
      const selectedService = realServices.find(s => s.title.trim() === value.trim());
      console.log('Package service selected:', {
        value,
        trimmedValue: value.trim(),
        selectedService,
        service_id: selectedService?.id,
        realServicesCount: realServices.length,
        availableServiceTitles: realServices.map(s => s.title)
      });
      updated[index] = {
        ...updated[index],
        [field]: value,
        service_id: selectedService?.id
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    console.log('Updated package pricing:', updated[index]);
    setPackagePricings(updated);
  };

  // Add/Remove functions
  const handleAddService = (category: 'In-Person / Clinic Visit' | 'Virtual Visit') => {
    const newService: ServicePricing = {
      service_name: '',
      first_time_price: '',
      first_time_duration: '',
      returning_price: '',
      returning_duration: '',
      is_sliding_scale: servicePricings[0]?.is_sliding_scale || false,
      sliding_scale_info: '',
      service_category: category,
    };

    if (category === 'In-Person / Clinic Visit') {
      setServicePricings([...servicePricings, newService]);
    } else {
      setVirtualPricings([...virtualPricings, newService]);
    }
  };

  const handleRemoveService = (index: number, category: 'In-Person / Clinic Visit' | 'Virtual Visit') => {
    if (category === 'In-Person / Clinic Visit') {
      if (servicePricings.length === 1) return;
      setServicePricings(servicePricings.filter((_, i) => i !== index));
    } else {
      if (virtualPricings.length === 1) return;
      setVirtualPricings(virtualPricings.filter((_, i) => i !== index));
    }
  };

  const handleAddPackage = () => {
    const newPackage: PackagePricing = {
      service_name: '',
      no_of_sessions: '',
      price: '',
      service_category: 'Packages',
    };
    setPackagePricings([...packagePricings, newPackage]);
  };

  const handleRemovePackage = (index: number) => {
    if (packagePricings.length === 1) return;
    setPackagePricings(packagePricings.filter((_, i) => i !== index));
  };

  // Save all changes
  const handleSaveAll = async () => {
    if (!profile?.id) {
      toast.error('Profile not found');
      return;
    }

    setIsSaving(true);

    try {
      // Combine address fields into single address string
      const combinedAddress = combineAddressFields();

      // Upload logo if changed
      let logoUrl = clinicInfo.clinic_logo;
      if (logoFile) {
        const uploadedUrl = await uploadLogo();
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          throw new Error('Failed to upload logo');
        }
      }

      // Upload video if changed
      let videoUrl = existingVideo;
      if (clinicVideoFile) {
        const uploadedVideoUrl = await uploadVideo();
        if (uploadedVideoUrl) {
          videoUrl = uploadedVideoUrl;
        } else {
          throw new Error('Failed to upload video');
        }
      } else if (videoDeleted) {
        // Video was explicitly deleted
        videoUrl = null;
      }

      // Upload new images
      const newImageUrls = await uploadImages();

      // Combine existing images with newly uploaded ones
      const existingImageUrls = clinicImages
        .filter(img => !img.isNew)
        .map(img => img.url);

      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      // Upsert clinic information in Clinics table
      // First try to update existing record
      const { data: existingClinic, error: selectError } = await supabase
        .from('Clinics')
        .select('id')
        .eq('practitioner_id', profile.id)
        .single();

      let clinicError = null;

      if (existingClinic) {
        // Update existing record
        const { error } = await supabase
          .from('Clinics')
          .update({
            clinic_name: clinicInfo.clinic_name,
            clinic_website: clinicInfo.clinic_website,
            clinic_phone: clinicInfo.clinic_phone,
            clinic_email: clinicInfo.clinic_email,
            clinic_address: combinedAddress,
            clinic_logo: logoUrl,
            clinic_video: videoUrl,
            clinic_images: allImageUrls,
          })
          .eq('practitioner_id', profile.id);

        clinicError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('Clinics')
          .insert({
            practitioner_id: profile.id,
            clinic_name: clinicInfo.clinic_name,
            clinic_website: clinicInfo.clinic_website,
            clinic_phone: clinicInfo.clinic_phone,
            clinic_email: clinicInfo.clinic_email,
            clinic_address: combinedAddress,
            clinic_logo: logoUrl,
            clinic_video: videoUrl,
            clinic_images: allImageUrls,
          });

        clinicError = error;
      }

      if (clinicError) throw clinicError;

      // Save service pricing if any services are filled
      const hasServices = servicePricings.some(sp => sp.service_name) ||
                         virtualPricings.some(vp => vp.service_name) ||
                         packagePricings.some(pkg => pkg.service_name);

      if (hasServices) {
        console.log('Saving service pricing:', {
          servicePricings,
          virtualPricings,
          packagePricings,
          combined: [...servicePricings, ...virtualPricings]
        });

        await saveServicePricing(
          profile.id,
          [...servicePricings, ...virtualPricings],
          packagePricings,
          true // true = clinic-specific pricing
        );
      }

      // Clear logo file state
      setLogoFile(null);
      setLogoPreview(null);

      // Clear media file state
      setClinicVideoFile(null);
      setClinicVideoPreview(null);
      setVideoDeleted(false);

      // Update existing media state with uploaded media
      if (videoUrl) {
        setExistingVideo(videoUrl);
      } else {
        setExistingVideo(null);
      }

      // Update clinic images to mark all as existing
      if (allImageUrls.length > 0) {
        setClinicImages(allImageUrls.map(url => ({ url, isNew: false, file: undefined })));
        setExistingImages(allImageUrls);
      } else {
        setClinicImages([]);
        setExistingImages([]);
      }

      toast.success('Clinic profile updated successfully!');
    } catch (error) {
      console.error('Error saving clinic profile:', error);
      toast.error('Failed to save clinic profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Building2 className="w-7 h-7 text-primary" />
          Update Clinic Profile
        </h2>
        <p className="text-gray-700">
          Manage your clinic information, services, and pricing. This information will be displayed on your clinic page.
        </p>
      </div>

      {/* Clinic Information Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Clinic Information
          </h3>
          <p className="text-sm text-gray-600 mt-1">Basic details about your clinic</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Clinic Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clinic Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={clinicInfo.clinic_name}
              onChange={(e) => setClinicInfo({ ...clinicInfo, clinic_name: e.target.value })}
              placeholder="Enter clinic name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Website and Business Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                Website
              </label>
              <input
                type="url"
                value={clinicInfo.clinic_website}
                onChange={(e) => setClinicInfo({ ...clinicInfo, clinic_website: e.target.value })}
                placeholder="https://www.example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                Business Phone
              </label>
              <PhoneInput
                country={'us'}
                value={clinicInfo.clinic_phone}
                onChange={(value) => setClinicInfo({ ...clinicInfo, clinic_phone: value })}
                disabled={isSaving}
                inputProps={{
                  name: 'clinic_phone',
                  disabled: isSaving,
                }}
                containerClass="w-full"
                inputClass="w-full"
                inputStyle={{
                  width: '100%',
                  height: '48px',
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
          </div>

          {/* Business Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              Business Email
            </label>
            <input
              type="email"
              value={clinicInfo.clinic_email}
              onChange={(e) => setClinicInfo({ ...clinicInfo, clinic_email: e.target.value })}
              placeholder="contact@clinic.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              Clinic Address
            </h4>

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
                placeholder="Start typing your address..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-1">
                Start typing to search for your address
              </p>
            </div>

            {/* Address Line 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2 <span className="text-gray-500 text-xs">(Suite, Unit, etc. - Optional)</span>
              </label>
              <input
                type="text"
                value={addressFields.address2}
                onChange={(e) => handleAddressFieldChange('address2', e.target.value)}
                placeholder="Suite, unit, building, floor, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={addressFields.city}
                  onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                  placeholder="City"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={addressFields.state}
                  onChange={(e) => handleAddressFieldChange('state', e.target.value)}
                  placeholder="State"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={addressFields.zip}
                  onChange={(e) => handleAddressFieldChange('zip', e.target.value)}
                  placeholder="ZIP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Clinic Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-gray-500" />
              Clinic Logo
            </label>
            <div className="space-y-4">
              {/* Current Logo or Preview */}
              {(logoPreview || clinicInfo.clinic_logo) && (
                <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={logoPreview || clinicInfo.clinic_logo}
                    alt="Clinic logo"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </span>
                </label>
                <span className="text-xs text-gray-500">Max size: 5MB (JPG, PNG)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Upload Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            Clinic Images & Video
          </h3>
          <p className="text-sm text-gray-600 mt-1">Upload images and video to showcase your clinic</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Video Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Film className="w-5 h-5 text-gray-500" />
              Clinic Video
              <span className="text-xs text-gray-500 font-normal">(Optional, Max 50MB)</span>
            </label>

            {/* Video Preview */}
            {(clinicVideoPreview || existingVideo) && (
              <div className="relative mb-4 rounded-lg overflow-hidden border-2 border-gray-200">
                <video
                  src={clinicVideoPreview || existingVideo || ''}
                  controls
                  className="w-full max-h-96 bg-black"
                >
                  Your browser does not support the video tag.
                </video>
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  title="Remove video"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Upload Button */}
            {!clinicVideoPreview && !existingVideo && (
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex-1">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3 px-6 py-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-100 transition-all">
                    <Film className="w-6 h-6 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Click to upload clinic video (MP4, MOV, AVI)
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Images Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gray-500" />
              Clinic Images
              <span className="text-xs text-gray-500 font-normal">(Optional, Max 10 images, 10MB each)</span>
            </label>

            {/* Images Grid */}
            {clinicImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {clinicImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src={image.url}
                        alt={`Clinic image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {clinicImages.length < 10 && (
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-3 px-6 py-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-100 transition-all">
                    <Upload className="w-6 h-6 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Click to upload clinic images (JPG, PNG, WEBP)
                    </span>
                  </div>
                </label>
              </div>
            )}

            {clinicImages.length >= 10 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                Maximum of 10 images reached. Remove an image to upload more.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services and Pricing Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Services and Pricing
          </h3>
          <p className="text-sm text-amber-700 mt-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
            <strong>Note:</strong> Fill out only if different than main account practitioner
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Sliding Scale Toggle */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  Sliding Scale Pricing?
                </label>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  If you offer sliding scale pricing, select <strong>Yes</strong> and enter the price range in the price field
                  <span className="inline-block ml-1 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">
                    e.g., $85 - $100
                  </span>
                </p>
                <select
                  value={servicePricings[0]?.is_sliding_scale ? 'yes' : 'no'}
                  onChange={(e) => {
                    const isSliding = e.target.value === 'yes';
                    setServicePricings(servicePricings.map(sp => ({ ...sp, is_sliding_scale: isSliding })));
                    setVirtualPricings(virtualPricings.map(vp => ({ ...vp, is_sliding_scale: isSliding })));
                  }}
                  className="w-full md:w-56 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
                >
                  <option value="no">No - Fixed Pricing</option>
                  <option value="yes">Yes - Sliding Scale</option>
                </select>
              </div>
            </div>
          </div>

          {/* In-Person / Clinic Visit Section */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-2 mb-5">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h4 className="text-lg font-bold text-gray-900">In-Person / Clinic Visit</h4>
            </div>
            <div className="space-y-4">
              {servicePricings.map((pricing, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* Service */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Service <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={pricing.service_name}
                        onChange={(e) => handleServiceChange(index, 'service_name', e.target.value, 'In-Person / Clinic Visit')}
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      >
                        <option value="">Select service</option>
                        {realServices.map((service) => (
                          <option key={service.id} value={service.title}>
                            {service.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* First Time Patient - Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        First Time - Price
                      </label>
                      <input
                        type="text"
                        value={pricing.first_time_price}
                        onChange={(e) => handleServiceChange(index, 'first_time_price', e.target.value, 'In-Person / Clinic Visit')}
                        placeholder={pricing.is_sliding_scale ? "$85 - $100" : "$85"}
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>

                    {/* First Time Patient - Duration */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        value={pricing.first_time_duration}
                        onChange={(e) => handleServiceChange(index, 'first_time_duration', e.target.value, 'In-Person / Clinic Visit')}
                        placeholder="60"
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>

                    {/* Returning Patient - Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Returning - Price
                      </label>
                      <input
                        type="text"
                        value={pricing.returning_price}
                        onChange={(e) => handleServiceChange(index, 'returning_price', e.target.value, 'In-Person / Clinic Visit')}
                        placeholder={pricing.is_sliding_scale ? "$75 - $90" : "$75"}
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>

                    {/* Returning Patient - Duration */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        value={pricing.returning_duration}
                        onChange={(e) => handleServiceChange(index, 'returning_duration', e.target.value, 'In-Person / Clinic Visit')}
                        placeholder="45"
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  {servicePricings.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveService(index, 'In-Person / Clinic Visit')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-600 rounded-lg font-medium transition-all"
                      >
                        <X className="w-4 h-4" />
                        Remove Service
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Service Button */}
            <button
              type="button"
              onClick={() => handleAddService('In-Person / Clinic Visit')}
              className="mt-5 w-full md:w-auto px-6 py-3 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Service
            </button>
          </div>

          {/* Virtual Visit Section */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
            <div className="flex items-center gap-2 mb-5">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h4 className="text-lg font-bold text-gray-900">Virtual Visit</h4>
            </div>
            <div className="space-y-4">
              {virtualPricings.map((pricing, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* Service */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Service <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={pricing.service_name}
                        onChange={(e) => handleServiceChange(index, 'service_name', e.target.value, 'Virtual Visit')}
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      >
                        <option value="">Select service</option>
                        {virtualServices.map((service) => (
                          <option key={service.id} value={service.title}>
                            {service.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* First Time Patient - Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        First Time - Price
                      </label>
                      <input
                        type="text"
                        value={pricing.first_time_price}
                        onChange={(e) => handleServiceChange(index, 'first_time_price', e.target.value, 'Virtual Visit')}
                        placeholder={pricing.is_sliding_scale ? "$85 - $100" : "$85"}
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>

                    {/* First Time Patient - Duration */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        value={pricing.first_time_duration}
                        onChange={(e) => handleServiceChange(index, 'first_time_duration', e.target.value, 'Virtual Visit')}
                        placeholder="60"
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>

                    {/* Returning Patient - Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Returning - Price
                      </label>
                      <input
                        type="text"
                        value={pricing.returning_price}
                        onChange={(e) => handleServiceChange(index, 'returning_price', e.target.value, 'Virtual Visit')}
                        placeholder={pricing.is_sliding_scale ? "$75 - $90" : "$75"}
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>

                    {/* Returning Patient - Duration */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        value={pricing.returning_duration}
                        onChange={(e) => handleServiceChange(index, 'returning_duration', e.target.value, 'Virtual Visit')}
                        placeholder="45"
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  {virtualPricings.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveService(index, 'Virtual Visit')}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-600 rounded-lg font-medium transition-all"
                      >
                        <X className="w-4 h-4" />
                        Remove Service
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Virtual Service Button */}
            <button
              type="button"
              onClick={() => handleAddService('Virtual Visit')}
              className="mt-5 w-full md:w-auto px-6 py-3 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Service
            </button>
          </div>

          {/* Packages Section */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
            <div className="flex items-center gap-2 mb-5">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h4 className="text-lg font-bold text-gray-900">Packages</h4>
            </div>
            <div className="space-y-4">
              {packagePricings.map((pkg, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Service */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Service <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={pkg.service_name}
                        onChange={(e) => handlePackageChange(index, 'service_name', e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      >
                        <option value="">Select service</option>
                        {realServices.map((service) => (
                          <option key={service.id} value={service.title}>
                            {service.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* No. of Sessions */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Number of Sessions
                      </label>
                      <input
                        type="number"
                        value={pkg.no_of_sessions}
                        onChange={(e) => handlePackageChange(index, 'no_of_sessions', e.target.value)}
                        placeholder="e.g., 5, 10"
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Package Price
                      </label>
                      <input
                        type="text"
                        value={pkg.price}
                        onChange={(e) => handlePackageChange(index, 'price', e.target.value)}
                        placeholder="$400"
                        className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  {packagePricings.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemovePackage(index)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-600 rounded-lg font-medium transition-all"
                      >
                        <X className="w-4 h-4" />
                        Remove Package
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Package Button */}
            <button
              type="button"
              onClick={handleAddPackage}
              className="mt-5 w-full md:w-auto px-6 py-3 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Package
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600 text-center sm:text-left">
            <svg className="w-5 h-5 inline mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Make sure all required fields are filled before saving
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:ml-auto">
            <button
              type="button"
              onClick={() => window.location.reload()}
              disabled={isSaving || saving}
              className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving || saving || uploadingLogo || servicesLoading}
              className="w-full sm:w-auto px-8 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg whitespace-nowrap"
            >
              {(isSaving || saving) ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save All Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateClinicProfile;
