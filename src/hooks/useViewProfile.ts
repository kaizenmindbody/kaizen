import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface ServicePricing {
  id: string;
  service_name: string;
  first_time_price: string;
  first_time_duration: string;
  returning_price: string;
  returning_duration: string;
  is_sliding_scale: boolean;
  service_category: string;
}

interface PackagePricing {
  id: string;
  service_name: string;
  no_of_sessions: string;
  price: string;
}

interface DescriptionsData {
  background?: string;
  education?: string;
  treatment?: string;
  firstVisit?: string;
  insurance?: string;
  cancellation?: string;
  language?: string[] | string;
}

interface MediaData {
  images: string[];
  video: string | null;
}

export interface UseViewProfileReturn {
  servicePricings: ServicePricing[];
  packagePricings: PackagePricing[];
  images: string[];
  video: string | null;
  descriptionsData: DescriptionsData | null;
  loading: boolean;
  error: string | null;
  fetchProfileData: (practitionerId: string) => Promise<void>;
}

export function useViewProfile(): UseViewProfileReturn {
  const [servicePricings, setServicePricings] = useState<ServicePricing[]>([]);
  const [packagePricings, setPackagePricings] = useState<PackagePricing[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [descriptionsData, setDescriptionsData] = useState<DescriptionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServicePricing = useCallback(async (practitionerId: string) => {
    try {
      const response = await fetch(`/api/service-pricing?practitionerId=${practitionerId}`);
      if (!response.ok) return;

      const data = await response.json();

      if (data.servicePricing) {
        const services = data.servicePricing.filter((sp: any) =>
          sp.service_category !== 'Packages'
        );
        const packages = data.servicePricing.filter((sp: any) =>
          sp.service_category === 'Packages'
        );

        setServicePricings(services);
        setPackagePricings(packages);
      }
    } catch (error) {
      setError('Failed to fetch service pricing');
    }
  }, []);

  const fetchDescriptions = useCallback(async (userId: string) => {
    try {
      const { data: descriptionsResult, error: descError } = await supabase
        .from('Descriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (descError) {
        return;
      }

      if (descriptionsResult) {
        // Parse language field if it's a string
        if (descriptionsResult.language) {
          descriptionsResult.language = typeof descriptionsResult.language === 'string'
            ? JSON.parse(descriptionsResult.language)
            : descriptionsResult.language;
        }
        setDescriptionsData(descriptionsResult);
      }
    } catch (error) {
      // Error fetching descriptions
    }
  }, []);

  const fetchMedia = useCallback(async (userId: string) => {
    try {
      // Fetch images and video from UserMedia table
      const { data: mediaData, error: mediaError } = await supabase
        .from('UserMedia')
        .select('file_url, file_type')
        .eq('user_id', userId)
        .order('display_order', { ascending: true });

      if (mediaError) {
        return;
      }

      if (mediaData) {
        const imageUrls = mediaData
          .filter(m => m.file_type === 'image')
          .map(m => m.file_url)
          .filter(url => url && url.trim() !== '');
        setImages(imageUrls);

        // Get video from UserMedia
        const videoData = mediaData.find(m => m.file_type === 'video');
        if (videoData?.file_url) {
          setVideo(videoData.file_url);
        }
      }
    } catch (error) {
      setError('Failed to fetch media');
    }
  }, []);

  const fetchProfileData = useCallback(async (practitionerId: string) => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchServicePricing(practitionerId),
        fetchDescriptions(practitionerId),
        fetchMedia(practitionerId),
      ]);
    } catch (error) {
      setError('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  }, [fetchServicePricing, fetchDescriptions, fetchMedia]);

  return {
    servicePricings,
    packagePricings,
    images,
    video,
    descriptionsData,
    loading,
    error,
    fetchProfileData,
  };
}
