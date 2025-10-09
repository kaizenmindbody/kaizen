import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface SignInData {
  email: string;
  password: string;
}

interface SignInResult {
  success: boolean;
  error?: string;
  redirectPath?: string;
}

export interface UseSignInReturn {
  signIn: (data: SignInData) => Promise<SignInResult>;
  isLoading: boolean;
}

export function useSignIn(): UseSignInReturn {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async (data: SignInData): Promise<SignInResult> => {
    setIsLoading(true);

    try {
      // Authenticate user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        let errorMessage = authError.message;

        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Authentication failed. Please try again.',
        };
      }

      // Fetch user profile to determine user type
      const { data: profile, error: profileError } = await supabase
        .from('Users')
        .select('type, isadmin')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        // Check if it's a "not found" error (user doesn't have a profile yet)
        if (profileError.code === 'PGRST116') {
          // User not found in Users table - this is expected for auth-only users
          console.log('User profile not found in Users table, redirecting to default profile page');
        } else {
          // Actual error occurred
          console.error('Error fetching user profile:', profileError);
        }

        // If we can't fetch profile, default to /profile
        return {
          success: true,
          redirectPath: '/profile',
        };
      }

      // Determine redirect path based on user type and admin status
      let redirectPath = '/profile'; // default

      if (profile?.isadmin === true) {
        redirectPath = '/admin';
      } else if (profile?.type?.toLowerCase() === 'eventhost') {
        redirectPath = '/eventhost';
      } else if (profile?.type?.toLowerCase() === 'practitioner') {
        redirectPath = '/profile';
      } else {
        // For other types, default to profile
        redirectPath = '/profile';
      }

      return {
        success: true,
        redirectPath,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    signIn,
    isLoading,
  };
}
