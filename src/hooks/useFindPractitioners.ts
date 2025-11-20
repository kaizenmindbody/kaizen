import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserData } from '@/types/user';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FetchPractitionersParams {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  specialty?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface UseFindPractitionersReturn {
  practitioners: UserData[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  fetchPractitioners: (params?: FetchPractitionersParams) => Promise<void>;
}

export function useFindPractitioners(): UseFindPractitionersReturn {
  const [practitioners, setPractitioners] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 3,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchPractitioners = useCallback(async (params: FetchPractitionersParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const {
        page = 1,
        limit = 3,
        search = '',
        location = '',
        specialty = '',
        sortBy = 'created_at',
        order = 'desc'
      } = params;

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build the query
      let query = supabase
        .from('Users')
        .select('*', { count: 'exact' })
        .eq('type', 'Practitioner');

      // Apply search filter
      if (search) {
        const searchTerm = search.toLowerCase();
        query = query.or(`firstname.ilike.%${searchTerm}%,lastname.ilike.%${searchTerm}%,ptype.ilike.%${searchTerm}%,clinic.ilike.%${searchTerm}%`);
      }

      // Apply specialty filter (using ptype)
      if (specialty && specialty !== 'All Specialties' && specialty !== '') {
        const searchTerm = specialty.toLowerCase();
        query = query.ilike('ptype', `%${searchTerm}%`);
      }

      // Apply location filter
      if (location) {
        query = query.ilike('address', `%${location}%`);
      }

      // Apply sorting
      if (sortBy === 'full_name') {
        // Sort by firstname when full_name is requested
        query = query.order('firstname', { ascending: order === 'asc' });
      } else {
        query = query.order(sortBy, { ascending: order === 'asc' });
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error: queryError, count } = await query;

      if (queryError) {
        throw queryError;
      }

      // Fetch backgrounds from Descriptions table for these users
      const userIds = data?.map(u => u.id) || [];
      let backgroundsMap = new Map();

      if (userIds.length > 0) {
        const { data: descriptions } = await supabase
          .from('Descriptions')
          .select('user_id, background, language')
          .in('user_id', userIds);

        if (descriptions) {
          descriptions.forEach(desc => {
            // Parse language field if it's a string
            let parsedLanguages = '';
            if (desc.language) {
              try {
                const languageArray = typeof desc.language === 'string'
                  ? JSON.parse(desc.language)
                  : desc.language;
                parsedLanguages = Array.isArray(languageArray) ? languageArray.join(', ') : desc.language;
              } catch {
                parsedLanguages = desc.language;
              }
            }

            backgroundsMap.set(desc.user_id, {
              background: desc.background,
              language: parsedLanguages
            });
          });
        }
      }

      // Process the data
      const processedData = data?.map(practitioner => {
        const description = backgroundsMap.get(practitioner.id);
        return {
          ...practitioner,
          degree: practitioner.degree || '',
          background: description?.background || '',
          description_languages: description?.language || ''
        };
      }) || [];

      setPractitioners(processedData);

      // Calculate pagination info
      const totalPages = Math.ceil((count || 0) / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      setPagination({
        currentPage: page,
        totalPages,
        totalCount: count || 0,
        limit,
        hasNextPage,
        hasPrevPage
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch practitioners');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    practitioners,
    loading,
    error,
    pagination,
    fetchPractitioners,
  };
}
