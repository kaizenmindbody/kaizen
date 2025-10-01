import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Clinic } from '@/types/clinic';

interface ClinicsState {
  clinics: Clinic[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: ClinicsState = {
  clinics: [],
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks
export const fetchClinics = createAsyncThunk(
  'clinics/fetchClinics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/clinics');

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch clinics');
    }
  }
);

export const addClinic = createAsyncThunk(
  'clinics/addClinic',
  async (clinicData: Partial<Clinic>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/clinics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clinicData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add clinic');
    }
  }
);

export const updateClinic = createAsyncThunk(
  'clinics/updateClinic',
  async ({ id, clinicData }: { id: number; clinicData: Partial<Clinic> }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/clinics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...clinicData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update clinic');
    }
  }
);

export const deleteClinic = createAsyncThunk(
  'clinics/deleteClinic',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/clinics', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete clinic');
    }
  }
);

// Slice
const clinicsSlice = createSlice({
  name: 'clinics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch clinics
    builder
      .addCase(fetchClinics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClinics.fulfilled, (state, action) => {
        state.loading = false;
        state.clinics = action.payload;
        state.initialized = true;
      })
      .addCase(fetchClinics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      });

    // Add clinic
    builder
      .addCase(addClinic.pending, (state) => {
        state.error = null;
      })
      .addCase(addClinic.fulfilled, (state, action) => {
        state.clinics.push(action.payload);
      })
      .addCase(addClinic.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update clinic
    builder
      .addCase(updateClinic.pending, (state) => {
        state.error = null;
      })
      .addCase(updateClinic.fulfilled, (state, action) => {
        const index = state.clinics.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.clinics[index] = action.payload;
        }
      })
      .addCase(updateClinic.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete clinic
    builder
      .addCase(deleteClinic.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteClinic.fulfilled, (state, action) => {
        state.clinics = state.clinics.filter(c => c.id !== action.payload);
      })
      .addCase(deleteClinic.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = clinicsSlice.actions;
export default clinicsSlice.reducer;