import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { FAQ } from '@/types/faq';

interface FaqsState {
  faqs: FAQ[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: FaqsState = {
  faqs: [],
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks
export const fetchFaqs = createAsyncThunk(
  'faqs/fetchFaqs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/faq');

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
      return rejectWithValue(error.message || 'Failed to fetch FAQs');
    }
  }
);

export const addFaq = createAsyncThunk(
  'faqs/addFaq',
  async (faqData: Partial<FAQ>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(faqData),
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
      return rejectWithValue(error.message || 'Failed to add FAQ');
    }
  }
);

export const updateFaq = createAsyncThunk(
  'faqs/updateFaq',
  async ({ id, faqData }: { id: number; faqData: Partial<FAQ> }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/faq', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...faqData }),
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
      return rejectWithValue(error.message || 'Failed to update FAQ');
    }
  }
);

export const deleteFaq = createAsyncThunk(
  'faqs/deleteFaq',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/faq', {
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
      return rejectWithValue(error.message || 'Failed to delete FAQ');
    }
  }
);

// Slice
const faqsSlice = createSlice({
  name: 'faqs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch FAQs
    builder
      .addCase(fetchFaqs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload;
        state.initialized = true;
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      });

    // Add FAQ
    builder
      .addCase(addFaq.pending, (state) => {
        state.error = null;
      })
      .addCase(addFaq.fulfilled, (state, action) => {
        state.faqs.push(action.payload);
      })
      .addCase(addFaq.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update FAQ
    builder
      .addCase(updateFaq.pending, (state) => {
        state.error = null;
      })
      .addCase(updateFaq.fulfilled, (state, action) => {
        const index = state.faqs.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.faqs[index] = action.payload;
        }
      })
      .addCase(updateFaq.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete FAQ
    builder
      .addCase(deleteFaq.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteFaq.fulfilled, (state, action) => {
        state.faqs = state.faqs.filter(f => f.id !== action.payload);
      })
      .addCase(deleteFaq.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = faqsSlice.actions;
export default faqsSlice.reducer;
