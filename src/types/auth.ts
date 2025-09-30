// Auth related interfaces

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  user_type?: string;
  avatar?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  specialty?: string;
  clinic?: string;
  bio?: string;
  website?: string;
  years_of_experience?: number;
  consultation_fee?: number;
  verified?: boolean;
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