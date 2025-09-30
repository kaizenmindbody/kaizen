import { useState, useEffect, useCallback } from 'react';
import { PaginationData, FetchParams, UsePractitionersDirectoryReturn } from '@/types/hooks';

export interface UserData {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone?: string;
  user_type: 'practitioner' | 'patient';
  address?: string;
  degrees?: string[];
  title?: string;
  specialty?: string;
  clinic?: string;
  website?: string;
  reviews?: number;
  rating?: number;
  rate?: number;
  languages?: string[];
  avatar?: string;
  updated_at?: string;
  aboutme?: string
}

// Using PaginationData, FetchParams, and UsePractitionersDirectoryReturn from centralized types

export function usePractitionersDirectory(): UsePractitionersDirectoryReturn {
  const [practitioners, setPractitioners] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const fetchPractitioners = useCallback(async (params: FetchParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Default to 3 items per page
      const defaultParams = {
        page: 1,
        limit: 3,
        sortBy: 'rate',
        order: 'asc',
        ...params
      };
      
      const searchParams = new URLSearchParams();
      Object.entries(defaultParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      });
      
      const response = await fetch(`/api/practitioners?${searchParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`HTTP ${response.status}: ${errorData.error || 'Failed to fetch practitioners'}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setPractitioners(result.practitioners || []);
      setPagination(result.pagination || null);
    } catch (err) {
      console.error('Error fetching practitioners:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch practitioners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPractitioners();
  }, [fetchPractitioners]);

  const refetch = async () => {
    await fetchPractitioners();
  };

  return { practitioners, loading, error, pagination, fetchPractitioners, refetch };
}