import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProfileData, UseProfileReturn } from '@/types/user';

// Using ProfileData and UseProfileReturn from centralized types

export function useProfile(): UseProfileReturn {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = async (profileData: Partial<ProfileData>) => {
    setIsUpdating(true);
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profileData,
          user_id: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update profile' 
      };
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateProfile, isUpdating };
}