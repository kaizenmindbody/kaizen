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
  address?: string;  // Full address as single field (street, city, state, zip)
  business_emails?: string[]; // Array of business email addresses
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
  ptype?: string; // Practitioner type (e.g., Acupuncturist, Chiropractor)
  certifications?: string;
  languages?: string[];
  insurance_accepted?: string[];
  consultation_fee?: number;
  specialty_rate?: number;
  availability?: any;
  verified?: boolean;
  status?: string;
  last_login?: string;
  profile_completed?: boolean;
  rating?: number;
  total_reviews?: number;
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

// User/Practitioner Data Interface for Find Practitioner page
export interface UserData {
  id: string;
  created_at: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  type: 'Practitioner' | 'Patient' | 'EventHost';
  address?: string;
  degree?: string;
  title?: string;
  ptype?: string; // Practitioner type (specialty)
  clinic?: string;
  website?: string;
  avatar?: string;
  clinicpage?: string;
  updated_at?: string;
  background?: string;
  description_languages?: string;
  aboutme?: string;
}

// Extended profile interface for profile page with additional fields
export interface ProfileData extends Omit<User, 'specialty_rate'> {
  aboutme?: string;
  specialty_rate?: {[key: string]: number};
  video?: string;
  images?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string[];
  insurance_provider?: string;
  professional_background?: string;
  education_credentials?: string;
  treatment_approach?: string;
  first_visit_expectations?: string;
  insurance_policy?: string;
  cancellation_policy?: string;
  practitioner_type?: string;
  reviews?: string;
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

// EventHost interface for event host specific data
export interface EventHost {
  id: string;                  // Auth user ID (UUID type in DB, string in TS)
  user_id: string;             // References Users.id (UUID type in DB, string in TS)
  business_name?: string;      // Event host or business name
  website?: string;            // Host website URL
  bio?: string;                // Host biography/description
  instagram?: string;          // Instagram profile URL
  facebook?: string;           // Facebook profile URL
  tiktok?: string;             // TikTok profile URL
  linkedin?: string;           // LinkedIn profile URL
  avatar?: string;             // Avatar/profile image URL
  host_image?: string;         // Alternative host profile image URL
  created_at: string;          // Record creation timestamp
  updated_at?: string;         // Last update timestamp
}