// Content-related hook interfaces

import { BlogPost } from './blog';
import { FAQ } from './faq';
import { Article, Icon, FAQ as HomeFAQ, PersonEvent, FAQItem, User as HomepageUser, Shop, Testimonial } from './homepage';
import { Clinic } from './clinic';

// About Us data interface
export interface AboutUsItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

// Hook return interfaces for content management
export interface UseBlogsReturn {
  blogs: BlogPost[];
  loading: boolean;
  error: string | null;
  addBlog: (blogData: Partial<BlogPost>) => Promise<boolean>;
  updateBlog: (id: number, blogData: Partial<BlogPost>) => Promise<boolean>;
  deleteBlog: (id: number) => Promise<boolean>;
  refreshBlogs: () => Promise<void>;
}

export interface UseArticlesReturn {
  articles: Article[];
  loading: boolean;
  error: string | null;
}

export interface UseFaqReturn {
  faqs: FAQ[];
  loading: boolean;
  error: string | null;
  addFaq: (faqData: Partial<FAQ>) => Promise<boolean>;
  updateFaq: (id: number, faqData: Partial<FAQ>) => Promise<boolean>;
  deleteFaq: (id: number) => Promise<boolean>;
  refreshFaqs: () => Promise<void>;
}

export interface UseHomeFaqsReturn {
  homeFaqs: HomeFAQ[];
  loading: boolean;
  error: string | null;
}

export interface UseTCMFaqsReturn {
  tcmFaqs: FAQItem[];
  loading: boolean;
  error: string | null;
}

export interface UsePersonEventsReturn {
  personEvents: PersonEvent[];
  loading: boolean;
  error: string | null;
}

export interface UseModalitiesReturn {
  modalities: Icon[];
  loading: boolean;
  error: string | null;
}

export interface UseConditionsReturn {
  conditions: Icon[];
  loading: boolean;
  error: string | null;
}

export interface UseTCMsReturn {
  tcms: HomepageUser[];
  loading: boolean;
  error: string | null;
}

export interface UseClinicsReturn {
  clinics: Clinic[];
  loading: boolean;
  error: string | null;
  addClinic: (clinicData: Partial<Clinic>) => Promise<boolean>;
  updateClinic: (id: number, clinicData: Partial<Clinic>) => Promise<boolean>;
  deleteClinic: (id: number) => Promise<boolean>;
  refreshClinics: () => Promise<void>;
}

export interface UseAboutUsReturn {
  aboutUsItems: AboutUsItem[];
  loading: boolean;
  error: string | null;
}

export interface UseSpecialtyReturn {
  specialties: any[];
  loading: boolean;
  error: string | null;
  fetchSpecialties: () => Promise<void>;
  createSpecialty: (data: any) => Promise<void>;
  updateSpecialty: (id: string, data: any) => Promise<void>;
  deleteSpecialty: (id: string) => Promise<void>;
}

// Unified home data interface
export interface UseHomeDataReturn {
  // Data
  conditions: Icon[];
  modalities: Icon[];
  tcms: HomepageUser[];
  tcmFaqs: FAQItem[];
  personEvents: PersonEvent[];
  homeFaqs: HomeFAQ[];
  shops: Shop[];
  testimonials: Testimonial[];

  // Loading states
  conditionsLoading: boolean;
  modalitiesLoading: boolean;
  tcmsLoading: boolean;
  tcmFaqsLoading: boolean;
  personEventsLoading: boolean;
  homeFaqsLoading: boolean;
  shopsLoading: boolean;
  testimonialsLoading: boolean;

  // Overall loading state
  isLoading: boolean;

  // Error states
  conditionsError: string | null;
  modalitiesError: string | null;
  tcmsError: string | null;
  tcmFaqsError: string | null;
  personEventsError: string | null;
  homeFaqsError: string | null;
  shopsError: string | null;
  testimonialsError: string | null;

  // Overall error state
  hasErrors: boolean;

  // Refresh functions
  refreshConditions: () => Promise<void>;
  refreshModalities: () => Promise<void>;
  refreshTcms: () => Promise<void>;
  refreshTcmFaqs: () => Promise<void>;
  refreshPersonEvents: () => Promise<void>;
  refreshHomeFaqs: () => Promise<void>;
  refreshShops: () => Promise<void>;
  refreshTestimonials: () => Promise<void>;
  refreshAll: () => Promise<void>;
}