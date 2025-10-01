import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/user';
import { FetchParams } from '@/types/hooks';

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  isDeleting: boolean;
  initialized: boolean;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  isDeleting: false,
  initialized: false,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: FetchParams = {}, { rejectWithValue }) => {
    try {
      // Default parameters
      const defaultParams = {
        page: 1,
        limit: 50,
        sortBy: 'created_at',
        order: 'desc',
        userType: 'all',
        ...params
      };

      // Build query
      let query = supabase
        .from('Users')
        .select('*', { count: 'exact' });

      // Apply user type filter
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

      // Apply sorting
      const sortColumn = defaultParams.sortBy || 'created_at';
      const sortOrder = defaultParams.order === 'asc';
      query = query.order(sortColumn, { ascending: sortOrder });

      // Apply pagination
      const from = (defaultParams.page - 1) * defaultParams.limit;
      const to = from + defaultParams.limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return { users: data || [], count: count || 0 };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Still use API route for deletion because it requires SERVICE_ROLE_KEY for RLS bypass
      const response = await fetch('/api/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error deleting user');
    }
  }
);

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.initialized = true;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = usersSlice.actions;
export default usersSlice.reducer;