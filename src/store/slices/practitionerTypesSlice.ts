import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface PractitionerType {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

interface PractitionerTypesState {
  practitionerTypes: PractitionerType[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: PractitionerTypesState = {
  practitionerTypes: [],
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks
export const fetchPractitionerTypes = createAsyncThunk(
  'practitionerTypes/fetchPractitionerTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/practitioner-types');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch practitioner types');
      }

      const data = await response.json();
      return data.practitionerTypes || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch practitioner types');
    }
  }
);

export const addPractitionerType = createAsyncThunk(
  'practitionerTypes/addPractitionerType',
  async (title: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/practitioner-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add practitioner type');
      }

      const data = await response.json();
      return data.practitionerType;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add practitioner type');
    }
  }
);

export const updatePractitionerType = createAsyncThunk(
  'practitionerTypes/updatePractitionerType',
  async ({ id, title }: { id: string; title: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/practitioner-types', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, title }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update practitioner type');
      }

      const data = await response.json();
      return data.practitionerType;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update practitioner type');
    }
  }
);

export const deletePractitionerType = createAsyncThunk(
  'practitionerTypes/deletePractitionerType',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/practitioner-types?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete practitioner type');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete practitioner type');
    }
  }
);

// Slice
const practitionerTypesSlice = createSlice({
  name: 'practitionerTypes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch practitioner types
    builder
      .addCase(fetchPractitionerTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPractitionerTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.practitionerTypes = action.payload;
        state.initialized = true;
      })
      .addCase(fetchPractitionerTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      });

    // Add practitioner type
    builder
      .addCase(addPractitionerType.pending, (state) => {
        state.error = null;
      })
      .addCase(addPractitionerType.fulfilled, (state, action) => {
        state.practitionerTypes.unshift(action.payload);
      })
      .addCase(addPractitionerType.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update practitioner type
    builder
      .addCase(updatePractitionerType.pending, (state) => {
        state.error = null;
      })
      .addCase(updatePractitionerType.fulfilled, (state, action) => {
        const index = state.practitionerTypes.findIndex(pt => pt.id === action.payload.id);
        if (index !== -1) {
          state.practitionerTypes[index] = action.payload;
        }
      })
      .addCase(updatePractitionerType.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete practitioner type
    builder
      .addCase(deletePractitionerType.pending, (state) => {
        state.error = null;
      })
      .addCase(deletePractitionerType.fulfilled, (state, action) => {
        state.practitionerTypes = state.practitionerTypes.filter(pt => pt.id !== action.payload);
      })
      .addCase(deletePractitionerType.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = practitionerTypesSlice.actions;
export default practitionerTypesSlice.reducer;
