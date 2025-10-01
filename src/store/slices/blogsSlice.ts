import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BlogPost } from '@/types/blog';

interface BlogsState {
  blogs: BlogPost[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: BlogsState = {
  blogs: [],
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks
export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/blogs');

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
      return rejectWithValue(error.message || 'Failed to fetch blogs');
    }
  }
);

export const addBlog = createAsyncThunk(
  'blogs/addBlog',
  async (blogData: Partial<BlogPost>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
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
      return rejectWithValue(error.message || 'Failed to add blog');
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blogs/updateBlog',
  async ({ id, blogData }: { id: number; blogData: Partial<BlogPost> }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/blogs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...blogData }),
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
      return rejectWithValue(error.message || 'Failed to update blog');
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blogs/deleteBlog',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/blogs', {
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
      return rejectWithValue(error.message || 'Failed to delete blog');
    }
  }
);

// Slice
const blogsSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Blogs
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload;
        state.initialized = true;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      });

    // Add Blog
    builder
      .addCase(addBlog.pending, (state) => {
        state.error = null;
      })
      .addCase(addBlog.fulfilled, (state, action) => {
        state.blogs.unshift(action.payload);
      })
      .addCase(addBlog.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update Blog
    builder
      .addCase(updateBlog.pending, (state) => {
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        const index = state.blogs.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Blog
    builder
      .addCase(deleteBlog.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter(b => b.id !== action.payload);
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = blogsSlice.actions;
export default blogsSlice.reducer;
