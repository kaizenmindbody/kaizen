export interface IconCardProps {
  src: string;
  name: string;
  iconBgColor: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

export interface Icon {
  name: string
  icon: string
}

export interface IconSearchCardProps {
  title?: string
  data: Icon[]
  bgColor?: string 
}

export interface User {
  id: string;
  name: string;
  role: string;
  url: string;
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string;
}

export interface FeaturedUsersProps {
  title?: string
  users: User[];
}

export interface UserCardProps {
  name: string;
  role: string;
  url: string;
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string;
  onTellMeMore: () => void;
  onBookAppointment: () => void;
  onNameClick?: () => void; // New prop for name click navigation
  isOwnProfile?: boolean; // New prop to disable booking for own profile
}

export interface FAQItem {
  id: number
  title: string
  url: string
}

export interface FAQSectionProps {
  title?: string
  faqItems: FAQItem[]
}

export interface Article {
  id: number
  title: string
  description: string
  author: string
  image: string
  date?: string
}

export interface ArticlesProps {
  title?: string
  articles: Article[]
}

export interface PersonEvent {
  id: number,
  title: string,
  date: string,
  price: number,
  instructor: string,
  clinic: string,
  address: string,
  location: string,
  description: string,
  image: string
}

export interface PersonEventProps {
  title?: string
  events: PersonEvent[]
}

export interface FAQ {
  id: number
  question: string
  answer: string
}

export interface FAQProps {
  title?: string
  faqs: FAQ[]
}

export interface Shop {
  id: number
  title: string
  image: string
}

export interface BrowseShopProps {
  title?: string
  shops: Shop[]
}

export interface Testimonial {
  id: number
  client: string
  description: string
  location: string
  image: string
}

export interface TestimonialsSectionProps {
  testimonials: Testimonial[]
}