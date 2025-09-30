// Common interfaces used across multiple hooks

// Pagination interface used by data fetching hooks
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Common fetch parameters interface
export interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: string;
  location?: string;
  sortBy?: string;
  order?: string;
  userType?: 'practitioner' | 'patient' | 'all';
}

// Generic hook return interface for data fetching hooks
export interface BaseHookReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

// Hook return interface with pagination
export interface PaginatedHookReturn<T> extends BaseHookReturn<T> {
  pagination: PaginationData | null;
  fetchData: (params?: FetchParams) => Promise<void>;
  refetch: () => Promise<void>;
}

// User-related hook returns
export interface UseUsersReturn {
  users: any[];
  loading: boolean;
  error: string | null;
  pagination: PaginationData | null;
  fetchUsers: (params?: FetchParams) => Promise<void>;
  refetch: () => Promise<void>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  isDeleting: boolean;
}

export interface UsePractitionersDirectoryReturn {
  practitioners: any[];
  loading: boolean;
  error: string | null;
  pagination: PaginationData | null;
  fetchPractitioners: (params?: FetchParams) => Promise<void>;
  refetch: () => Promise<void>;
}

// Profile hook return
export interface UseProfileReturn {
  profile: any | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: any) => Promise<void>;
}