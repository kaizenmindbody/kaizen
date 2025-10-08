import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface DescriptionsData {
  id?: string;
  user_id: string;
  background?: string;
  education?: string;
  treatment?: string;
  firstVisit?: string;
  insurance?: string;
  cancellation?: string;
  language?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UseDescriptionsReturn {
  descriptions: DescriptionsData | null;
  loading: boolean;
  error: string | null;
  updateDescriptions: (data: Partial<DescriptionsData>) => Promise<{ success: boolean; error?: string }>;
  isUpdating: boolean;
  refreshDescriptions: () => Promise<void>;
}

export function useDescriptions(userId?: string): UseDescriptionsReturn {
  const [descriptions, setDescriptions] = useState<DescriptionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDescriptions = async (uid: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('Descriptions')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (fetchError) {
        // If no record exists, that's ok - we'll create one on first save
        if (fetchError.code === 'PGRST116') {
          setDescriptions(null);
          return;
        }
        throw fetchError;
      }

      // Parse language field if it's a string
      if (data && data.language) {
        data.language = typeof data.language === 'string' ? JSON.parse(data.language) : data.language;
      }

      setDescriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch descriptions');
    } finally {
      setLoading(false);
    }
  };

  const refreshDescriptions = async () => {
    if (userId) {
      await fetchDescriptions(userId);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDescriptions(userId);
    }
  }, [userId]);

  const updateDescriptions = async (data: Partial<DescriptionsData>) => {
    setIsUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare data for update/insert
      const descriptionData = {
        ...data,
        user_id: user.id,
        language: data.language ? JSON.stringify(data.language) : undefined
      };

      // Check if a record exists
      const { data: existing } = await supabase
        .from('Descriptions')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existing) {
        // Update existing record
        result = await supabase
          .from('Descriptions')
          .update(descriptionData)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from('Descriptions')
          .insert(descriptionData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      // Parse language back to array
      if (result.data && result.data.language) {
        result.data.language = typeof result.data.language === 'string'
          ? JSON.parse(result.data.language)
          : result.data.language;
      }

      setDescriptions(result.data);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update descriptions'
      };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    descriptions,
    loading,
    error,
    updateDescriptions,
    isUpdating,
    refreshDescriptions
  };
}
