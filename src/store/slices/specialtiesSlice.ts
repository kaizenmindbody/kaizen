import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Specialty } from '@/types/user';

interface SpecialtiesState {
  specialties: Specialty[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: SpecialtiesState = {
  specialties: [],
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks
export const fetchSpecialties = createAsyncThunk(
  'specialties/fetchSpecialties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/specialty');

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
      return rejectWithValue(error.message || 'Failed to fetch specialties');
    }
  }
);

export const addSpecialty = createAsyncThunk(
  'specialties/addSpecialty',
  async (title: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/specialty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title.trim() }),
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
      return rejectWithValue(error.message || 'Failed to add specialty');
    }
  }
);

export const updateSpecialty = createAsyncThunk(
  'specialties/updateSpecialty',
  async ({ id, title }: { id: string; title: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/specialty', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, title: title.trim() }),
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
      return rejectWithValue(error.message || 'Failed to update specialty');
    }
  }
);

export const deleteSpecialty = createAsyncThunk(
  'specialties/deleteSpecialty',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/specialty', {
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
      return rejectWithValue(error.message || 'Failed to delete specialty');
    }
  }
);

// Slice
const specialtiesSlice = createSlice({
  name: 'specialties',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch specialties
    builder
      .addCase(fetchSpecialties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpecialties.fulfilled, (state, action) => {
        state.loading = false;
        state.specialties = action.payload;
        state.initialized = true;
      })
      .addCase(fetchSpecialties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      });

    // Add specialty
    builder
      .addCase(addSpecialty.pending, (state) => {
        state.error = null;
      })
      .addCase(addSpecialty.fulfilled, (state, action) => {
        state.specialties.push(action.payload);
      })
      .addCase(addSpecialty.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update specialty
    builder
      .addCase(updateSpecialty.pending, (state) => {
        state.error = null;
      })
      .addCase(updateSpecialty.fulfilled, (state, action) => {
        const index = state.specialties.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.specialties[index] = action.payload;
        }
      })
      .addCase(updateSpecialty.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete specialty
    builder
      .addCase(deleteSpecialty.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteSpecialty.fulfilled, (state, action) => {
        state.specialties = state.specialties.filter(s => s.id !== action.payload);
      })
      .addCase(deleteSpecialty.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = specialtiesSlice.actions;
export default specialtiesSlice.reducer;