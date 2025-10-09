import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserData, EventHost } from '@/types/user';

interface EventData {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  status: string;
  created_at: string;
}

export interface UseEventHostReturn {
  profile: UserData | null;
  hostProfile: EventHost | null;
  events: EventData[];
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  fetchHostProfile: (userId: string) => Promise<void>;
  fetchEvents: (userId: string) => Promise<void>;
  updateHostProfile: (data: Partial<EventHost>) => Promise<{ success: boolean; error?: string }>;
  refreshData: (userId: string) => Promise<void>;
}

export function useEventHost(): UseEventHostReturn {
  const [profile, setProfile] = useState<UserData | null>(null);
  const [hostProfile, setHostProfile] = useState<EventHost | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      setError(null);
      const { data, error: profileError } = await supabase
        .from('Users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (data) {
        setProfile(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    }
  }, []);

  const fetchHostProfile = useCallback(async (userId: string) => {
    try {
      setError(null);
      const { data, error: hostError } = await supabase
        .from('EventHosts')
        .select('*')
        .eq('id', userId)
        .single();

      if (hostError && hostError.code !== 'PGRST116') {
        throw hostError;
      }

      if (data) {
        setHostProfile(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch host profile');
    }
  }, []);

  const fetchEvents = useCallback(async (userId: string) => {
    try {
      setError(null);
      const { data, error: eventsError } = await supabase
        .from('Events')
        .select('*')
        .eq('host_id', userId)
        .order('start_date', { ascending: false });

      if (eventsError) throw eventsError;

      if (data) {
        setEvents(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    }
  }, []);

  const updateHostProfile = useCallback(async (data: Partial<EventHost>): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: updateError } = await supabase
        .from('EventHosts')
        .upsert({
          id: data.id,
          user_id: data.user_id,
          business_name: data.business_name,
          website: data.website,
          bio: data.bio,
          instagram: data.instagram,
          facebook: data.facebook,
          tiktok: data.tiktok,
          linkedin: data.linkedin,
          host_image: data.host_image,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Refresh host profile after update
      if (data.id) {
        await fetchHostProfile(data.id);
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update host profile',
      };
    }
  }, [fetchHostProfile]);

  const refreshData = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProfile(userId),
        fetchHostProfile(userId),
        fetchEvents(userId),
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, fetchHostProfile, fetchEvents]);

  return {
    profile,
    hostProfile,
    events,
    loading,
    error,
    fetchProfile,
    fetchHostProfile,
    fetchEvents,
    updateHostProfile,
    refreshData,
  };
}
