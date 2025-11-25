"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, AuthContextType } from '@/types/auth';
import { suppressSupabaseAuthErrors } from '@/lib/suppress-errors';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Cache to prevent redundant API calls
  const lastFetchedUserId = useRef<string | null>(null);
  const isFetchingProfile = useRef<boolean>(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Suppress non-critical Supabase auth errors on mount
  useEffect(() => {
    suppressSupabaseAuthErrors();
  }, []);

  const fetchUserProfile = useCallback(async (userId: string, userEmail: string) => {
    // Clear any pending timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }

    // Prevent concurrent fetches for the same user
    if (isFetchingProfile.current && lastFetchedUserId.current === userId) {
      return;
    }

    // Skip if we already have this user's profile cached
    if (lastFetchedUserId.current === userId) {
      setLoading(false);
      return;
    }

    // Debounce rapid calls - wait 150ms before actually fetching
    fetchTimeoutRef.current = setTimeout(async () => {
      // Double-check after debounce delay
      if (lastFetchedUserId.current === userId) {
        setLoading(false);
        return;
      }

      isFetchingProfile.current = true;
      lastFetchedUserId.current = userId;

      try {
        // Skip profile fetch for admin user if not in database
        if (userEmail === 'admin@admin.com') {
          setUserProfile({
            id: userId,
            email: userEmail,
            full_name: 'Admin User',
            avatar: null,
            user_type: 'admin'
          });
          setLoading(false);
          isFetchingProfile.current = false;
          return;
        }

        const { data, error } = await supabase
          .from('Users')
          .select('id, email, firstname, lastname, avatar, type, phone, website, clinic, title, degree, address, clinicpage')
          .eq('id', userId)
          .single();

        if (error) {
          // Handle "no rows returned" error gracefully - user doesn't exist in Users table yet
          if (error.code === 'PGRST116') {
            setUserProfile({
              id: userId,
              email: userEmail,
              full_name: userEmail.split('@')[0],
              avatar: null,
              user_type: 'patient'
            });
            setLoading(false);
            isFetchingProfile.current = false;
            return;
          }

          setLoading(false);
          isFetchingProfile.current = false;
          return;
        }

        if (!data) {
          // Create a basic profile if no data exists
          setUserProfile({
            id: userId,
            email: userEmail,
            full_name: userEmail.split('@')[0],
            avatar: null,
            user_type: 'patient'
          });
          setLoading(false);
          isFetchingProfile.current = false;
          return;
        }

        const fullName = [data.firstname, data.lastname].filter(Boolean).join(' ');

        setUserProfile({
          ...data,
          full_name: fullName || undefined,
          user_type: data.type
        });
        setLoading(false);
        isFetchingProfile.current = false;
      } catch (error) {
        setLoading(false);
        isFetchingProfile.current = false;
      }
    }, 150);
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          // Even with error, continue initialization
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        // Check if user is admin and fetch profile if authenticated
        if (session?.user) {
          setIsAdmin(session.user.email === 'admin@admin.com');
          // Only fetch if we don't have this user's profile cached
          if (lastFetchedUserId.current !== session.user.id) {
            fetchUserProfile(session.user.id, session.user.email || '');
          } else {
            setLoading(false);
          }
        } else {
          setIsAdmin(false);
          setUserProfile(null);
          lastFetchedUserId.current = null;
          setLoading(false);
        }
      })
      .catch((err) => {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setUserProfile(null);
        setLoading(false);
      });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);

          // Check if user is admin and fetch profile if authenticated
          if (session?.user) {
            setIsAdmin(session.user.email === 'admin@admin.com');
            // Only fetch if user changed or we don't have profile cached
            if (lastFetchedUserId.current !== session.user.id) {
              fetchUserProfile(session.user.id, session.user.email || '');
            } else {
              setLoading(false);
            }
          } else {
            setUserProfile(null);
            setIsAdmin(false);
            lastFetchedUserId.current = null;
            setLoading(false);
          }
        } catch (err) {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setUserProfile(null);
          lastFetchedUserId.current = null;
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchUserProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      // Force refresh by clearing cache
      lastFetchedUserId.current = null;
      isFetchingProfile.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      await fetchUserProfile(user.id, user.email || '');
    }
  }, [user, fetchUserProfile]);

  const signOut = async () => {
    try {
      // Clear local state first
      setUserProfile(null);
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      lastFetchedUserId.current = null;
      isFetchingProfile.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }

      // Clear any local storage that might be persisting session
      if (typeof window !== 'undefined') {
        // Clear all Supabase related storage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });

        // Clear session storage too
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            sessionStorage.removeItem(key);
          }
        });
      }

      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();

      // Handle common Supabase sign out errors gracefully
      if (error) {
        if (error.message === 'Auth session missing!' ||
            error.message.includes('session') ||
            error.code === 'session_not_found') {
        } else {
          // Don't throw - still proceed with cleanup
        }
      }

      // Always redirect to home page with a full reload to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      }
    } catch (error) {
      // Ensure cleanup always happens
      setUserProfile(null);
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      lastFetchedUserId.current = null;
      isFetchingProfile.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      }
    }
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    isAdmin,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
