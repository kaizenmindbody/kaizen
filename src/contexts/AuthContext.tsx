"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile, AuthContextType } from '@/types/auth';

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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext - Initial session:', session?.user?.email || 'No user');
      setSession(session);
      setUser(session?.user ?? null);

      // Check if user is admin and fetch profile if authenticated
      if (session?.user) {
        setIsAdmin(session.user.email === 'admin@admin.com');
        fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setIsAdmin(false);
        setUserProfile(null);
      }

      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext - Auth state change:', event, session?.user?.email || 'No user');
        setSession(session);
        setUser(session?.user ?? null);

        // Check if user is admin and fetch profile if authenticated
        if (session?.user) {
          setIsAdmin(session.user.email === 'admin@admin.com');
          fetchUserProfile(session.user.id, session.user.email || '');
        } else {
          setUserProfile(null);
          setIsAdmin(false);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, userEmail: string) => {
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
        return;
      }

      const { data, error } = await supabase
        .from('Users')
        .select('id, email, firstname, lastname, avatar, type, phone, website, clinic, title, degree, address, clinicpage')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return;
      }

      if (!data) {
        console.error('No user data returned');
        return;
      }

      const fullName = [data.firstname, data.lastname].filter(Boolean).join(' ');

      setUserProfile({
        ...data,
        full_name: fullName || undefined,
        user_type: data.type
      });
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id, user.email || '');
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');

      // Clear local state first
      setUserProfile(null);
      setUser(null);
      setSession(null);
      setIsAdmin(false);

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
          console.log('Session already cleared or missing, proceeding with cleanup');
        } else {
          console.error('Sign out error (non-critical):', error);
          // Don't throw - still proceed with cleanup
        }
      } else {
        console.log('Successfully signed out from Supabase');
      }

      // Always redirect regardless of Supabase result
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out process error:', error);
      // Ensure cleanup always happens
      setUserProfile(null);
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      window.location.href = '/';
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