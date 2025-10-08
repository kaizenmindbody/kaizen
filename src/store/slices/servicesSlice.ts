import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Service } from '@/hooks/useService';

interface ServicesState {
  services: Service[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: ServicesState = {
  services: [],
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks
export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/services');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch services');
      }

      const data = await response.json();
      return data.services || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch services');
    }
  }
);

export const addService = createAsyncThunk(
  'services/addService',
  async ({ title, type }: { title: string; type: 'real' | 'virtual' }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add service');
      }

      const data = await response.json();
      return data.service;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add service');
    }
  }
);

export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, title, type }: { id: string; title: string; type: 'real' | 'virtual' }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/services', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, title, type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update service');
      }

      const data = await response.json();
      return data.service;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update service');
    }
  }
);

export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/services?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete service');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete service');
    }
  }
);

// Slice
const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch services
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload;
        state.initialized = true;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      });

    // Add service
    builder
      .addCase(addService.pending, (state) => {
        state.error = null;
      })
      .addCase(addService.fulfilled, (state, action) => {
        state.services.unshift(action.payload);
      })
      .addCase(addService.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update service
    builder
      .addCase(updateService.pending, (state) => {
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.services.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete service
    builder
      .addCase(deleteService.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.services = state.services.filter(s => s.id !== action.payload);
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = servicesSlice.actions;
export default servicesSlice.reducer;
