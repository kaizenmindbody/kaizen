export interface User {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  full_name?: string; // Computed field
  type?: string; // Database column
  user_type?: string; // Alias for compatibility
  avatar?: string;
  created_at: string;
  updated_at?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
  bio?: string;
  website?: string;
  specialty_id?: string;
  specialty?: string;
  clinic?: string;
  clinicpage?: string;
  license_number?: string;
  years_of_experience?: number;
  education?: string;
  degree?: string;
  title?: string;
  certifications?: string;
  languages?: string[];
  insurance_accepted?: string[];
  consultation_fee?: number;
  specialty_rate?: number;
  availability?: any;
  rating?: number;
  total_reviews?: number;
  verified?: boolean;
  status?: string;
  last_login?: string;
  profile_completed?: boolean;
}

export interface Specialty {
  id: string;
  title: string;
  created_at: string;
}

export interface Degree {
  id: string;
  title: string;
  created_at: string;
}

export interface Stats {
  totalUsers: number;
  totalPractitioners: number;
  totalPatients: number;
  totalSpecialties: number;
}

export interface UsersProps {
  users: User[];
  specialties: Specialty[];
  onRefreshData: () => void;
}

// Extended profile interface for profile page with additional fields
export interface ProfileData extends Omit<User, 'specialty_rate'> {
  rate?: number;
  experience?: string;
  aboutme?: string;
  specialty_rate?: {[key: string]: number};
  reviews?: string;
  video?: string;
  images?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string[];
  insurance_provider?: string;
}

// Hook interfaces for user-related hooks
export interface UseProfileReturn {
  updateProfile: (profileData: Partial<ProfileData>) => Promise<{ success: boolean; error?: string }>;
  isUpdating: boolean;
}

export interface UseSpecialtyReturn {
  specialties: Specialty[];
  loading: boolean;
  error: string | null;
  addSpecialty: (title: string) => Promise<boolean>;
  updateSpecialty: (id: string, title: string) => Promise<boolean>;
  deleteSpecialty: (id: string) => Promise<boolean>;
  refreshSpecialties: () => Promise<void>;
}

export interface UseDegreeReturn {
  degrees: Degree[];
  loading: boolean;
  error: string | null;
  addDegree: (title: string) => Promise<boolean>;
  updateDegree: (id: string, title: string) => Promise<boolean>;
  deleteDegree: (id: string) => Promise<boolean>;
  refreshDegrees: () => Promise<void>;
}