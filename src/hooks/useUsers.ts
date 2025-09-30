import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/user';
import { PaginationData, FetchParams, UseUsersReturn } from '@/types/hooks';

// Using interfaces from centralized types

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async (params: FetchParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Default parameters
      const defaultParams = {
        page: 1,
        limit: 50,
        sortBy: 'created_at',
        order: 'desc',
        userType: 'all',
        ...params
      };

      // Build query - start simple like admin page
      let query = supabase
        .from('Users')
        .select('*', { count: 'exact' });

      // Apply user type filter first (this works in admin)
      if (defaultParams.userType && defaultParams.userType !== 'all') {
        query = query.eq('user_type', defaultParams.userType);
      }

      // Apply search filter
      if (defaultParams.search) {
        query = query.or(`full_name.ilike.%${defaultParams.search}%,email.ilike.%${defaultParams.search}%`);
      }

      // Apply specialty filter
      if (defaultParams.specialty) {
        query = query.ilike('specialty', `%${defaultParams.specialty}%`);
      }

      // Apply location filter
      if (defaultParams.location) {
        query = query.or(`city.ilike.%${defaultParams.location}%,state.ilike.%${defaultParams.location}%`);
      }

      // Apply sorting - use created_at as default like admin
      const sortColumn = defaultParams.sortBy || 'created_at';
      const sortOrder = defaultParams.order === 'asc';
      query = query.order(sortColumn, { ascending: sortOrder });

      // Apply pagination
      const from = (defaultParams.page - 1) * defaultParams.limit;
      const to = from + defaultParams.limit - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setUsers(data || []);

      // Set pagination data
      if (count !== null) {
        const totalPages = Math.ceil(count / defaultParams.limit);
        setPagination({
          currentPage: defaultParams.page,
          totalPages,
          totalCount: count,
          limit: defaultParams.limit,
          hasNextPage: defaultParams.page < totalPages,
          hasPrevPage: defaultParams.page > 1,
        });
      }

    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = async () => {
    await fetchUsers();
  };

  const deleteUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('Users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Refresh the users list after deletion
      await refetch();

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error deleting user'
      };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    refetch,
    deleteUser,
    isDeleting,
  };
}