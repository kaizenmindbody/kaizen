// Auth related interfaces

export interface UserProfile {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  full_name?: string; // Computed from firstname + lastname
  type?: string; // Database column name (practitioner | patient)
  user_type?: string; // Mapped from type for compatibility
  avatar?: string;
  phone?: string;
  title?: string;
  degree?: string;
  clinic?: string;
  website?: string;
  clinicpage?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: any | null; // Supabase User type
  session: any | null; // Supabase Session type
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}