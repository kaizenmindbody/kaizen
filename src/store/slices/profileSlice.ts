import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface BasicInfoData {
  first_name: string;
  last_name: string;
  title?: string;
  degree?: string;
  type_of_practitioner?: string;
  clinic_name?: string;
  create_clinic_page?: string;
  website?: string;
  business_phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

interface ProfileState {
  avatar: string | null;
  loading: boolean;
  saving: boolean;
  uploadingAvatar: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ProfileState = {
  avatar: null,
  loading: false,
  saving: false,
  uploadingAvatar: false,
  error: null,
  successMessage: null,
};

// Async thunk for uploading avatar
export const uploadAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (
    {
      userId,
      avatarFile,
      oldAvatarUrl,
      token,
    }: {
      userId: string;
      avatarFile: File;
      oldAvatarUrl: string | null;
      token: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('avatar', avatarFile);
      if (oldAvatarUrl) {
        formData.append('oldAvatarUrl', oldAvatarUrl);
      }

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload avatar');
      }

      const result = await response.json();
      return result.avatarUrl;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload avatar');
    }
  }
);

// Async thunk for removing avatar
export const removeAvatar = createAsyncThunk(
  'profile/removeAvatar',
  async (
    {
      userId,
      avatarUrl,
      token,
    }: {
      userId: string;
      avatarUrl: string;
      token: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, avatarUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove avatar');
      }

      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove avatar');
    }
  }
);

// Async thunk for updating basic information
export const updateBasicInfo = createAsyncThunk(
  'profile/updateBasicInfo',
  async (
    {
      userId,
      data,
      token,
    }: {
      userId: string;
      data: BasicInfoData;
      token: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // Construct full address from parts
      const addressParts = [
        data.address_line1,
        data.address_line2,
        data.city,
        data.state,
        data.zip_code
      ].map(part => (part || '').trim()).join(', ');

      const updateData = {
        user_id: userId,
        firstname: data.first_name.trim(),
        lastname: data.last_name.trim(),
        title: data.title?.trim() || null,
        degree: data.degree || null,
        ptype: data.type_of_practitioner?.trim() || null,
        clinic: data.clinic_name?.trim() || null,
        clinicpage: data.create_clinic_page || null,
        website: data.website?.trim() || null,
        phone: data.business_phone || null,
        address: addressParts || null,
      };

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setAvatar: (state, action) => {
      state.avatar = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Upload avatar
    builder
      .addCase(uploadAvatar.pending, (state) => {
        state.uploadingAvatar = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.uploadingAvatar = false;
        state.avatar = action.payload;
        state.successMessage = 'Avatar updated successfully!';
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.uploadingAvatar = false;
        state.error = action.payload as string;
      });

    // Remove avatar
    builder
      .addCase(removeAvatar.pending, (state) => {
        state.uploadingAvatar = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(removeAvatar.fulfilled, (state) => {
        state.uploadingAvatar = false;
        state.avatar = null;
        state.successMessage = 'Avatar removed successfully!';
      })
      .addCase(removeAvatar.rejected, (state, action) => {
        state.uploadingAvatar = false;
        state.error = action.payload as string;
      });

    // Update basic info
    builder
      .addCase(updateBasicInfo.pending, (state) => {
        state.saving = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateBasicInfo.fulfilled, (state) => {
        state.saving = false;
        state.successMessage = 'Account updated successfully!';
      })
      .addCase(updateBasicInfo.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccessMessage, setAvatar } = profileSlice.actions;
export default profileSlice.reducer;
