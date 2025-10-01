import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Degree } from '@/types/user';

interface DegreesState {
  degrees: Degree[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: DegreesState = {
  degrees: [],
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks
export const fetchDegrees = createAsyncThunk(
  'degrees/fetchDegrees',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/degrees');

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
      return rejectWithValue(error.message || 'Failed to fetch degrees');
    }
  }
);

export const addDegree = createAsyncThunk(
  'degrees/addDegree',
  async (title: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/degrees', {
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
      return rejectWithValue(error.message || 'Failed to add degree');
    }
  }
);

export const updateDegree = createAsyncThunk(
  'degrees/updateDegree',
  async ({ id, title }: { id: string; title: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/degrees', {
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
      return rejectWithValue(error.message || 'Failed to update degree');
    }
  }
);

export const deleteDegree = createAsyncThunk(
  'degrees/deleteDegree',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/degrees', {
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
      return rejectWithValue(error.message || 'Failed to delete degree');
    }
  }
);

// Slice
const degreesSlice = createSlice({
  name: 'degrees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch degrees
    builder
      .addCase(fetchDegrees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDegrees.fulfilled, (state, action) => {
        state.loading = false;
        state.degrees = action.payload;
        state.initialized = true;
      })
      .addCase(fetchDegrees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      });

    // Add degree
    builder
      .addCase(addDegree.pending, (state) => {
        state.error = null;
      })
      .addCase(addDegree.fulfilled, (state, action) => {
        state.degrees.push(action.payload);
      })
      .addCase(addDegree.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update degree
    builder
      .addCase(updateDegree.pending, (state) => {
        state.error = null;
      })
      .addCase(updateDegree.fulfilled, (state, action) => {
        const index = state.degrees.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.degrees[index] = action.payload;
        }
      })
      .addCase(updateDegree.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete degree
    builder
      .addCase(deleteDegree.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteDegree.fulfilled, (state, action) => {
        state.degrees = state.degrees.filter(d => d.id !== action.payload);
      })
      .addCase(deleteDegree.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = degreesSlice.actions;
export default degreesSlice.reducer;
