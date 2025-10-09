import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface MediaItem {
  id?: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_type: 'image' | 'video';
  mime_type: string;
  is_primary?: boolean;
  display_order?: number;
}

interface MediaState {
  images: string[];
  video: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  initialized: boolean;
}

const initialState: MediaState = {
  images: [],
  video: null,
  loading: false,
  saving: false,
  error: null,
  successMessage: null,
  initialized: false,
};

// Async thunks
export const fetchMedia = createAsyncThunk(
  'media/fetchMedia',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/media?userId=${userId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch media');
      }

      const data = await response.json();
      return data.media || [];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch media');
    }
  }
);

export const uploadMedia = createAsyncThunk(
  'media/uploadMedia',
  async (
    {
      userId,
      images,
      video,
      token,
    }: {
      userId: string;
      images: File[];
      video: File | null;
      token: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);

      // Add images
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      // Add video
      if (video) {
        formData.append('video', video);
      }

      const response = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload media');
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload media');
    }
  }
);

export const deleteMediaItem = createAsyncThunk(
  'media/deleteMediaItem',
  async (
    {
      userId,
      fileUrl,
      fileType,
      token,
    }: {
      userId: string;
      fileUrl: string;
      fileType: 'image' | 'video';
      token: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch('/api/media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          fileUrl,
          fileType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete media');
      }

      return { fileUrl, fileType };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete media');
    }
  }
);

// Slice
const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setImages: (state, action) => {
      state.images = action.payload;
    },
    setVideo: (state, action) => {
      state.video = action.payload;
    },
    resetMedia: (state) => {
      state.images = [];
      state.video = null;
      state.error = null;
      state.successMessage = null;
      state.initialized = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch media
    builder
      .addCase(fetchMedia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedia.fulfilled, (state, action) => {
        state.loading = false;

        // Separate images and video
        const images = action.payload
          .filter((item: MediaItem) => item.file_type === 'image')
          .map((item: MediaItem) => item.file_url)
          .filter((url: string) => url && url.trim() !== '');

        const videoItem = action.payload.find((item: MediaItem) => item.file_type === 'video');

        state.images = images;
        state.video = videoItem?.file_url || null;
        state.initialized = true;
      })
      .addCase(fetchMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      });

    // Upload media
    builder
      .addCase(uploadMedia.pending, (state) => {
        state.saving = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(uploadMedia.fulfilled, (state, action) => {
        state.saving = false;
        state.successMessage = 'Media uploaded successfully!';
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    // Delete media item
    builder
      .addCase(deleteMediaItem.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteMediaItem.fulfilled, (state, action) => {
        if (action.payload.fileType === 'image') {
          state.images = state.images.filter(url => url !== action.payload.fileUrl);
        } else if (action.payload.fileType === 'video') {
          state.video = null;
        }
        state.successMessage = 'Media deleted successfully!';
      })
      .addCase(deleteMediaItem.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearSuccessMessage,
  setImages,
  setVideo,
  resetMedia,
} = mediaSlice.actions;

export default mediaSlice.reducer;
