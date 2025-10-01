import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers as fetchUsersAction, deleteUser as deleteUserAction } from '@/store/slices/usersSlice';
import { FetchParams, UseUsersReturn } from '@/types/hooks';

export function useUsers(): UseUsersReturn {
  const dispatch = useAppDispatch();
  const { users, loading, error, isDeleting, initialized } = useAppSelector((state) => state.users);

  const fetchUsers = useCallback(async (params: FetchParams = {}) => {
    await dispatch(fetchUsersAction(params));
  }, [dispatch]);

  useEffect(() => {
    // Only fetch if data has never been loaded before
    if (!initialized) {
      dispatch(fetchUsersAction({}));
    }
  }, [initialized, dispatch]);

  const refetch = useCallback(async () => {
    await dispatch(fetchUsersAction({}));
  }, [dispatch]);

  const deleteUser = useCallback(async (userId: string): Promise<{ success: boolean; error?: string }> => {
    const result = await dispatch(deleteUserAction(userId));

    if (deleteUserAction.fulfilled.match(result)) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.payload as string || 'Error deleting user'
      };
    }
  }, [dispatch]);

  return {
    users,
    loading,
    error,
    pagination: null, // Pagination can be added later if needed
    fetchUsers,
    refetch,
    deleteUser,
    isDeleting,
  };
}