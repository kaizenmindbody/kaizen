import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface ServicePricing {
  id?: string;
  service_id?: string;
  service_name: string;
  first_time_price: string;
  first_time_duration: string;
  returning_price: string;
  returning_duration: string;
  is_sliding_scale: boolean;
  sliding_scale_info?: string;
  service_category?: string;
}

export interface PackagePricing {
  id?: string;
  service_id?: string;
  service_name: string;
  no_of_sessions: string;
  price: string;
  service_category?: string;
}

interface ServicePricingState {
  servicePricings: ServicePricing[];
  packagePricings: PackagePricing[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  initialized: boolean;
}

const initialState: ServicePricingState = {
  servicePricings: [],
  packagePricings: [],
  loading: false,
  saving: false,
  error: null,
  successMessage: null,
  initialized: false,
};

// Async thunks
export const fetchServicePricing = createAsyncThunk(
  'servicePricing/fetchServicePricing',
  async (practitionerId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/service-pricing?practitionerId=${practitionerId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch service pricing');
      }

      const data = await response.json();
      return data.servicePricing || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch service pricing');
    }
  }
);

export const saveServicePricing = createAsyncThunk(
  'servicePricing/saveServicePricing',
  async (
    {
      practitionerId,
      servicePricings,
      packagePricings,
      token,
    }: {
      practitionerId: string;
      servicePricings: ServicePricing[];
      packagePricings: PackagePricing[];
      token: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch('/api/service-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          practitionerId,
          servicePricings,
          packagePricings,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save service pricing');
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save service pricing');
    }
  }
);

// Slice
const servicePricingSlice = createSlice({
  name: 'servicePricing',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setServicePricings: (state, action) => {
      state.servicePricings = action.payload;
    },
    setPackagePricings: (state, action) => {
      state.packagePricings = action.payload;
    },
    resetServicePricing: (state) => {
      state.servicePricings = [];
      state.packagePricings = [];
      state.error = null;
      state.successMessage = null;
      state.initialized = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch service pricing
    builder
      .addCase(fetchServicePricing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicePricing.fulfilled, (state, action) => {
        state.loading = false;

        // Separate service pricings and package pricings
        const servicePricings = action.payload.filter(
          (sp: any) => sp.service_category === 'In-Person / Clinic Visit' || sp.service_category === 'Virtual Visit'
        ).map((sp: any) => ({
          id: sp.id,
          service_id: sp.service_id,
          service_name: sp.service_name,
          first_time_price: sp.first_time_price || '',
          first_time_duration: sp.first_time_duration?.toString() || '',
          returning_price: sp.returning_price || '',
          returning_duration: sp.returning_duration?.toString() || '',
          is_sliding_scale: sp.is_sliding_scale || false,
          sliding_scale_info: sp.sliding_scale_info || '',
          service_category: sp.service_category,
        }));

        const packagePricings = action.payload.filter(
          (sp: any) => sp.service_category === 'Packages'
        ).map((sp: any) => ({
          id: sp.id,
          service_id: sp.service_id,
          service_name: sp.service_name,
          no_of_sessions: sp.no_of_sessions?.toString() || '',
          price: sp.price || '',
          service_category: sp.service_category || 'Packages',
        }));

        state.servicePricings = servicePricings.length > 0 ? servicePricings : [];
        state.packagePricings = packagePricings.length > 0 ? packagePricings : [];
        state.initialized = true;
      })
      .addCase(fetchServicePricing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      });

    // Save service pricing
    builder
      .addCase(saveServicePricing.pending, (state) => {
        state.saving = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(saveServicePricing.fulfilled, (state, action) => {
        state.saving = false;
        state.successMessage = 'Service pricing saved successfully!';
      })
      .addCase(saveServicePricing.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearSuccessMessage,
  setServicePricings,
  setPackagePricings,
  resetServicePricing,
} = servicePricingSlice.actions;

export default servicePricingSlice.reducer;
