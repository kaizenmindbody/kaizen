import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  uploadAvatar as uploadAvatarAction,
  removeAvatar as removeAvatarAction,
  updateBasicInfo as updateBasicInfoAction,
  clearError,
  clearSuccessMessage,
  setAvatar,
  BasicInfoData,
} from '@/store/slices/profileSlice';
import { useAuth } from '@/contexts/AuthContext';

export interface UseBasicInformationReturn {
  avatar: string | null;
  loading: boolean;
  saving: boolean;
  uploadingAvatar: boolean;
  error: string | null;
  successMessage: string | null;
  uploadAvatar: (userId: string, avatarFile: File, oldAvatarUrl: string | null) => Promise<boolean>;
  removeAvatar: (userId: string, avatarUrl: string) => Promise<boolean>;
  updateBasicInfo: (userId: string, data: BasicInfoData) => Promise<boolean>;
  setAvatar: (avatarUrl: string | null) => void;
  clearError: () => void;
  clearSuccessMessage: () => void;
}

export function useBasicInformation(): UseBasicInformationReturn {
  const dispatch = useAppDispatch();
  const { session } = useAuth();
  const {
    avatar,
    loading,
    saving,
    uploadingAvatar,
    error,
    successMessage,
  } = useAppSelector((state) => state.profile);

  const uploadAvatarHandler = useCallback(
    async (userId: string, avatarFile: File, oldAvatarUrl: string | null): Promise<boolean> => {
      try {
        // Get the session token from AuthContext
        const token = session?.access_token;

        if (!token) {
          throw new Error('Not authenticated. Please sign in again.');
        }

        const result = await dispatch(
          uploadAvatarAction({
            userId,
            avatarFile,
            oldAvatarUrl,
            token,
          })
        );

        if (result.meta.requestStatus === 'fulfilled') {
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error in uploadAvatar:', error);
        return false;
      }
    },
    [dispatch, session]
  );

  const removeAvatarHandler = useCallback(
    async (userId: string, avatarUrl: string): Promise<boolean> => {
      try {
        // Get the session token from AuthContext
        const token = session?.access_token;

        if (!token) {
          throw new Error('Not authenticated. Please sign in again.');
        }

        const result = await dispatch(
          removeAvatarAction({
            userId,
            avatarUrl,
            token,
          })
        );

        if (result.meta.requestStatus === 'fulfilled') {
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error in removeAvatar:', error);
        return false;
      }
    },
    [dispatch, session]
  );

  const updateBasicInfoHandler = useCallback(
    async (userId: string, data: BasicInfoData): Promise<boolean> => {
      try {
        // Get the session token from AuthContext
        const token = session?.access_token;

        if (!token) {
          throw new Error('Not authenticated. Please sign in again.');
        }

        const result = await dispatch(
          updateBasicInfoAction({
            userId,
            data,
            token,
          })
        );

        if (result.meta.requestStatus === 'fulfilled') {
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error in updateBasicInfo:', error);
        return false;
      }
    },
    [dispatch, session]
  );

  const setAvatarHandler = useCallback(
    (avatarUrl: string | null) => {
      dispatch(setAvatar(avatarUrl));
    },
    [dispatch]
  );

  const clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearSuccessMessageHandler = useCallback(() => {
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  return {
    avatar,
    loading,
    saving,
    uploadingAvatar,
    error,
    successMessage,
    uploadAvatar: uploadAvatarHandler,
    removeAvatar: removeAvatarHandler,
    updateBasicInfo: updateBasicInfoHandler,
    setAvatar: setAvatarHandler,
    clearError: clearErrorHandler,
    clearSuccessMessage: clearSuccessMessageHandler,
  };
}
