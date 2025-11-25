import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchMedia as fetchMediaAction,
  uploadMedia as uploadMediaAction,
  deleteMediaItem as deleteMediaItemAction,
  clearError,
  clearSuccessMessage,
  setImages,
  setVideos,
  resetMedia,
  MediaItem,
} from '@/store/slices/mediaSlice';
import { supabase } from '@/lib/supabase';

export interface UseImageVideoReturn {
  images: string[];
  videos: string[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  fetchMedia: (userId: string) => Promise<void>;
  uploadImages: (userId: string, images: File[]) => Promise<boolean>;
  uploadVideos: (userId: string, videos: File[]) => Promise<boolean>;
  uploadMedia: (userId: string, images: File[], videos: File[]) => Promise<boolean>;
  deleteImage: (userId: string, fileUrl: string) => Promise<boolean>;
  deleteVideo: (userId: string, fileUrl: string) => Promise<boolean>;
  updateImages: (images: string[]) => void;
  updateVideos: (videos: string[]) => void;
  clearError: () => void;
  clearSuccessMessage: () => void;
  resetMedia: () => void;
}

export function useImageVideo(userId?: string): UseImageVideoReturn {
  const dispatch = useAppDispatch();
  const {
    images,
    videos,
    loading,
    saving,
    error,
    successMessage,
    initialized,
  } = useAppSelector((state) => state.media);

  const fetchMedia = useCallback(async (userId: string) => {
    await dispatch(fetchMediaAction(userId));
  }, [dispatch]);

  const uploadImagesHandler = useCallback(
    async (userId: string, images: File[]): Promise<boolean> => {
      try {
        // Get the session token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error('Not authenticated. Please sign in again.');
        }

        const result = await dispatch(
          uploadMediaAction({
            userId,
            images,
            video: null,
            token,
          })
        );

        if (result.meta.requestStatus === 'fulfilled') {
          // Reload data after successful upload
          await dispatch(fetchMediaAction(userId));
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  const uploadVideosHandler = useCallback(
    async (userId: string, videos: File[]): Promise<boolean> => {
      try {
        // Get the session token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error('Not authenticated. Please sign in again.');
        }

        if (videos.length === 0) {
          throw new Error('No video files selected for upload');
        }

        const formData = new FormData();
        formData.append('userId', userId);

        // Add videos to formData
        videos.forEach((video, index) => {
          formData.append(`video_${index}`, video);
        });

        const response = await fetch('/api/media', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          // Reload data after successful upload
          await dispatch(fetchMediaAction(userId));
          return true;
        } else {
          // Try to get error message from response
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Upload failed with status ${response.status}`);
        }
      } catch (error: any) {
        // Re-throw error so it can be caught by the component
        throw error;
      }
    },
    [dispatch]
  );

  const uploadMediaHandler = useCallback(
    async (userId: string, images: File[], videos: File[]): Promise<boolean> => {
      try {
        // Get the session token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error('Not authenticated. Please sign in again.');
        }

        const uploadedMedia: Array<{
          file_url: string;
          file_name: string;
          file_type: 'image' | 'video';
          mime_type: string;
        }> = [];

        // Upload images directly to Supabase storage
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const fileExt = image.name.split('.').pop();
          const fileName = `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `usermedia/${fileName}`;

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('kaizen')
            .upload(filePath, image);

          if (uploadError) {
            throw new Error(`Failed to upload ${image.name}: ${uploadError.message}`);
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('kaizen')
            .getPublicUrl(filePath);

          uploadedMedia.push({
            file_url: publicUrl,
            file_name: image.name,
            file_type: 'image',
            mime_type: image.type,
          });
        }

        // Upload videos directly to Supabase storage
        for (let i = 0; i < videos.length; i++) {
          const video = videos[i];
          const fileExt = video.name.split('.').pop();
          const fileName = `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `usermedia/${fileName}`;

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('kaizen')
            .upload(filePath, video);

          if (uploadError) {
            throw new Error(`Failed to upload ${video.name}: ${uploadError.message}`);
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('kaizen')
            .getPublicUrl(filePath);

          uploadedMedia.push({
            file_url: publicUrl,
            file_name: video.name,
            file_type: 'video',
            mime_type: video.type,
          });
        }

        // Now send only metadata to the API route
        const response = await fetch('/api/media', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            media: uploadedMedia,
          }),
        });

        if (response.ok) {
          // Reload data after successful upload
          await dispatch(fetchMediaAction(userId));
          return true;
        } else {
          // Try to get error message from response
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Upload failed with status ${response.status}`);
        }
      } catch (error: any) {
        // Re-throw error so it can be caught by the component
        throw error;
      }
    },
    [dispatch]
  );

  const deleteImageHandler = useCallback(
    async (userId: string, fileUrl: string): Promise<boolean> => {
      try {
        // Get the session token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error('Not authenticated. Please sign in again.');
        }

        const result = await dispatch(
          deleteMediaItemAction({
            userId,
            fileUrl,
            fileType: 'image',
            token,
          })
        );

        if (result.meta.requestStatus === 'fulfilled') {
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  const deleteVideoHandler = useCallback(
    async (userId: string, fileUrl: string): Promise<boolean> => {
      try {
        // Get the session token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error('Not authenticated. Please sign in again.');
        }

        const result = await dispatch(
          deleteMediaItemAction({
            userId,
            fileUrl,
            fileType: 'video',
            token,
          })
        );

        if (result.meta.requestStatus === 'fulfilled') {
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  const updateImages = useCallback(
    (images: string[]) => {
      dispatch(setImages(images));
    },
    [dispatch]
  );

  const updateVideos = useCallback(
    (videos: string[]) => {
      dispatch(setVideos(videos));
    },
    [dispatch]
  );

  const clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearSuccessMessageHandler = useCallback(() => {
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  const resetMediaHandler = useCallback(() => {
    dispatch(resetMedia());
  }, [dispatch]);

  // Auto-fetch media on mount if userId is provided
  useEffect(() => {
    if (userId && !initialized) {
      fetchMedia(userId);
    }
  }, [userId, initialized, fetchMedia]);

  return {
    images,
    videos,
    loading,
    saving,
    error,
    successMessage,
    fetchMedia,
    uploadImages: uploadImagesHandler,
    uploadVideos: uploadVideosHandler,
    uploadMedia: uploadMediaHandler,
    deleteImage: deleteImageHandler,
    deleteVideo: deleteVideoHandler,
    updateImages,
    updateVideos,
    clearError: clearErrorHandler,
    clearSuccessMessage: clearSuccessMessageHandler,
    resetMedia: resetMediaHandler,
  };
}
